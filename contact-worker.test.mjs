import assert from 'node:assert/strict';
import test from 'node:test';
import { handleRequest } from './contact-worker.mjs';

const origin = 'https://dyunetra.dpdns.org';
const originalFetch = globalThis.fetch;

function makeRequest(overrides = {}) {
  const body = {
    name: 'Test Sender',
    email: 'test@example.com',
    organisation: 'Test Organisation',
    interest: 'General enquiry',
    message: 'A clearly marked contact test.',
    website: '',
    ts: String(Date.now() - 5000),
    ...overrides
  };
  return new Request(`https://dyunetra.dpdns.org/api/contact`, {
    method: 'POST',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '192.0.2.10'
    },
    body: JSON.stringify(body)
  });
}

function makeEnv() {
  return {
    ALLOWED_ORIGINS: origin,
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'public-key',
    CONTACT_FROM_EMAIL: 'founder@dyunetra.dpdns.org',
    CONTACT_TO_EMAIL: 'dyunetra@gmail.com',
    BREVO_API_KEY: 'test-key',
    CONTACT_FORM_LIMITER: { limit: async () => ({ success: true }) },
    ASSETS: { fetch: async () => new Response('asset') }
  };
}

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('stores the message and sends an email notification', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response(null, { status: 201 });
  };

  const response = await handleRequest(makeRequest(), makeEnv());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, emailAccepted: true });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://project.supabase.co/rest/v1/messages');
  assert.equal(calls[1].url, 'https://api.brevo.com/v3/smtp/email');
  const email = JSON.parse(calls[1].options.body);
  assert.equal(email.to[0].email, 'dyunetra@gmail.com');
  assert.match(email.textContent, /someone submitted the contact form/);
  assert.match(email.htmlContent, /dyunetra\.dpdns\.org\/contact/);
  assert.match(email.htmlContent, /A clearly marked contact test\./);
});

test('escapes submitted values in the HTML notification', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response(null, { status: 201 });
  };

  await handleRequest(makeRequest({
    name: '<img src=x>',
    message: 'Please review <script>alert("x")</script>'
  }), makeEnv());
  const email = JSON.parse(calls[1].options.body);
  assert.match(email.htmlContent, /&lt;img src=x&gt;/);
  assert.match(email.htmlContent, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.doesNotMatch(email.htmlContent, /<script>/);
});

test('reports stored messages when email notification fails', async () => {
  let callCount = 0;
  globalThis.fetch = async () => {
    callCount += 1;
    return callCount === 1 ? new Response(null, { status: 201 }) : new Response(null, { status: 401 });
  };

  const response = await handleRequest(makeRequest(), makeEnv());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, emailAccepted: false });
});

test('does not send email when storage fails', async () => {
  let callCount = 0;
  globalThis.fetch = async () => {
    callCount += 1;
    return new Response(null, { status: 403 });
  };

  const response = await handleRequest(makeRequest(), makeEnv());
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { ok: false, error: 'Could not save your message. Please try again.' });
  assert.equal(callCount, 1);
});

test('rejects disallowed origins before making requests', async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response(null, { status: 201 });
  };

  const request = new Request('https://dyunetra.dpdns.org/api/contact', {
    method: 'POST',
    headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
    body: '{}'
  });
  const response = await handleRequest(request, makeEnv());
  assert.equal(response.status, 403);
  assert.equal(called, false);
});

test('silently drops honeypot submissions', async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response(null, { status: 201 });
  };

  const response = await handleRequest(makeRequest({ website: 'bot' }), makeEnv());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, emailAccepted: true });
  assert.equal(called, false);
});

test('stops submissions when the IP rate limit is reached', async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response(null, { status: 201 });
  };
  const env = makeEnv();
  env.CONTACT_FORM_LIMITER.limit = async () => ({ success: false });

  const response = await handleRequest(makeRequest(), env);
  assert.equal(response.status, 429);
  assert.equal(called, false);
});
