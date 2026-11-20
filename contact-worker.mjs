const interests = new Set([
  'General enquiry',
  'IT Consulting',
  'Cybersecurity',
  'Blockchain',
  'Artificial Intelligence',
  'MEVONU',
  'QEVRAXIS',
  'DevAI'
]);

const controlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function jsonResponse(data, status, origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function clean(value, limit, singleLine) {
  if (typeof value !== 'string') return null;
  const text = value.replace(controlCharacters, '').trim();
  const normalized = singleLine ? text.replace(/[\r\n]+/g, ' ') : text;
  return normalized.length <= limit ? normalized : null;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function decoy(origin) {
  return jsonResponse({ ok: true, emailAccepted: true }, 200, origin);
}

export async function handleRequest(request, env) {
  const url = new URL(request.url);
  if (url.pathname !== '/api/contact') return env.ASSETS.fetch(request);

  const origin = request.headers.get('Origin');
  const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map((item) => item.trim());
  if (!origin || !allowedOrigins.includes(origin)) {
    return jsonResponse({ ok: false, error: 'Request blocked.' }, 403);
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin'
      }
    });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, origin);
  }
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '')) {
    return jsonResponse({ ok: false, error: 'Expected a JSON request.' }, 415, origin);
  }
  if (Number(request.headers.get('Content-Length')) > 12000) {
    return jsonResponse({ ok: false, error: 'Message is too large.' }, 413, origin);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rate = await env.CONTACT_FORM_LIMITER.limit({ key: ip });
  if (!rate.success) {
    return jsonResponse({ ok: false, error: 'Too many submissions. Please try again later.' }, 429, origin);
  }

  let submission;
  try {
    const body = await request.text();
    if (body.length > 12000) return jsonResponse({ ok: false, error: 'Message is too large.' }, 413, origin);
    submission = JSON.parse(body);
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid form data.' }, 400, origin);
  }
  if (!submission || typeof submission !== 'object' || Array.isArray(submission)) {
    return jsonResponse({ ok: false, error: 'Invalid form data.' }, 400, origin);
  }
  if (clean(submission.website || '', 200, true) || !Number.isFinite(Number(submission.ts)) || Date.now() - Number(submission.ts) < 3000) {
    return decoy(origin);
  }

  const name = clean(submission.name, 100, true);
  const email = clean(submission.email, 150, true);
  const organisation = clean(submission.organisation || '', 120, true);
  const interest = clean(submission.interest || 'General enquiry', 60, true);
  const message = clean(submission.message, 4000, false);
  if (name === null || name.length < 2 || email === null || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      organisation === null || interest === null || message === null || message.length < 10) {
    return jsonResponse({ ok: false, error: 'Please check the required fields and try again.' }, 422, origin);
  }

  const record = { name, email, organisation, interest: interests.has(interest) ? interest : 'General enquiry', message };
  let stored;
  try {
    stored = await fetch(new URL('/rest/v1/messages', env.SUPABASE_URL), {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(10000)
    });
  } catch {
    console.error('Contact message storage request failed.');
    return jsonResponse({ ok: false, error: 'Could not save your message. Please try again.' }, 502, origin);
  }
  if (!stored.ok) {
    console.error('Contact message storage rejected the request:', stored.status);
    return jsonResponse({ ok: false, error: 'Could not save your message. Please try again.' }, 502, origin);
  }

  let emailAccepted = false;
  if (env.BREVO_API_KEY) {
    try {
      const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Dyunetra', email: env.CONTACT_FROM_EMAIL },
          to: [{ email: env.CONTACT_TO_EMAIL }],
          replyTo: { email, name },
          subject: `[Dyunetra] ${record.interest} — ${name}`,
          htmlContent: `<!doctype html>
<html><body>
<h1>New contact form submission</h1>
<p>This is a notification because someone submitted the contact form on <a href="https://dyunetra.dpdns.org/contact">dyunetra.dpdns.org</a>.</p>
<dl>
<dt>Name</dt><dd>${escapeHtml(name)}</dd>
<dt>Email</dt><dd>${escapeHtml(email)}</dd>
<dt>Organisation</dt><dd>${escapeHtml(organisation || '(not provided)')}</dd>
<dt>Interest</dt><dd>${escapeHtml(record.interest)}</dd>
</dl>
<h2>Message</h2>
<p style="white-space:pre-wrap">${escapeHtml(message)}</p>
<p>Reply to this email to respond to the sender.</p>
</body></html>`,
          textContent: [
            'This is a notification because someone submitted the contact form on https://dyunetra.dpdns.org/contact.',
            `Name: ${name}`,
            `Email: ${email}`,
            `Organisation: ${organisation || '(not provided)'}`,
            `Interest: ${record.interest}`,
            '',
            message
          ].join('\n')
        }),
        signal: AbortSignal.timeout(10000)
      });
      emailAccepted = emailResponse.ok;
      if (!emailAccepted) console.error('Brevo rejected the contact notification:', emailResponse.status);
    } catch {
      console.error('Brevo contact notification request failed.');
    }
  } else {
    console.error('BREVO_API_KEY is not configured.');
  }

  return jsonResponse({ ok: true, emailAccepted }, 200, origin);
}

export default { fetch: handleRequest };
