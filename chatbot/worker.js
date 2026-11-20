// Dyunetra Assistant Worker — fast AI path (Workers AI with timeout, upstream fallback)
const MAX_MESSAGES = 10;
const MAX_CHARS = 1500;
const RATE_LIMIT = 12;
const WINDOW_MS = 60000;

const KNOWLEDGE = `You are the Dyunetra Assistant on dyunetra.dpdns.org.
Dyunetra (Dyu-Netra, "eye of the sky") is a technology company founded by Yashwardhan Katkamwar, born from Team Dyunetra — the Bajaj Institute of Technology team that won Smart India Hackathon 2022 (Software Edition) on IMD/MoES problem statements.
Dyunetra works across cybersecurity, blockchain, AI and IT consulting.
Products:
- MEVONU: Open DFIR Intelligence Platform. Offline-first, AI-assisted digital investigations; every action cryptographically attributable; human-readable rationale. Tagline: Evidence. Intelligence. Integrity.
- QEVRAXIS: Quantum intelligence, adaptive protection, advanced security architecture. Deep-learning network defence (CNN-Bi, trained on CIC-IDS2017, CSE-CIC-IDS2018, UNSW-NB15), real-time monitoring, centralised dashboard. Tagline: Intelligence That Defends. Technology That Evolves.
- DevAI: Secure AI Workforce Platform. Governed AI employees for research, reporting and coding support with approved access, human oversight and auditable execution. Tagline: Your AI workforce, securely in action.
Contact: founder@dyunetra.dpdns.org (also the Contact page). Founder on LinkedIn: yashwardhan-devalyst, GitHub: Yashwardhan-kv.
Rules: Be concise (max ~120 words). Use facts above or obvious general knowledge. Never invent product features, prices or certifications. Never give attack instructions or malware help. If asked something you do not know, point to the Contact page. Format sparingly with **bold**, *italic* and links.`;

const hits = new Map();

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const corsOk = allowed.includes(origin);
    const corsHeaders = corsOk ? { 'Access-Control-Allow-Origin': origin } : {};

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: corsOk ? 204 : 403,
        headers: { ...corsHeaders, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' }
      });
    }

    try {
      if (request.method !== 'POST') return J({ error: 'POST only' }, 405, corsHeaders);
      if (!corsOk) return J({ error: 'Origin not allowed' }, 403, corsHeaders);

      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (!allow(ip)) return J({ error: 'Too many requests' }, 429, corsHeaders);

      let body;
      try { body = await request.json(); } catch { return J({ error: 'Invalid JSON' }, 400, corsHeaders); }

      const msgs = Array.isArray(body.messages) ? body.messages : [];
      const clean = [];
      for (const m of msgs.slice(-MAX_MESSAGES)) {
        if (!m || typeof m.content !== 'string') continue;
        clean.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.slice(0, MAX_CHARS) });
      }
      if (!clean.length || clean[clean.length - 1].role !== 'user') return J({ error: 'No user message' }, 400, corsHeaders);

      // Only keep the LAST user message for speed (history adds latency with no benefit here)
      const lastUser = clean[clean.length - 1].content;

      let reply = null;
      const ai = env.AI;
      if (ai) {
        const res = await Promise.race([
          ai.run('@cf/meta/llama-4-scout-17b-16e-instruct', {
            messages: [
              { role: 'system', content: KNOWLEDGE + '\nAnswer in 1-3 short sentences max.' },
              { role: 'user', content: lastUser }
            ],
            max_tokens: 180,
            temperature: 0.3
          }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('AI timeout')), 22000))
        ]).catch(e => { console.log('AI err:', String(e.message).slice(0, 80)); return null; });
        if (res && res.response) reply = res.response;
      }

      // fallback: OpenAI-compatible upstream
      if (!reply) {
        const base = (env.UPSTREAM_BASE_URL || '').replace(/\/+$/, '');
        if (base) {
          const r = await Promise.race([
            fetch(base + '/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (env.UPSTREAM_API_KEY || '') },
              body: JSON.stringify({ model: env.MODEL || 'default', messages: [{ role: 'system', content: KNOWLEDGE }, ...clean], max_tokens: 300 })
            }),
            new Promise((_, rej) => setTimeout(() => rej(new Error('upstream timeout')), 20000))
          ]).catch(e => ({ ok: false, text: () => Promise.resolve(String(e.message).slice(0, 80)) }));

          if (r.ok) {
            const jn = await r.json();
            reply = jn.choices && jn.choices[0] && jn.choices[0].message && jn.choices[0].message.content;
          }
        }
      }

      if (!reply) return J({ error: 'Assistant is busy right now. Please try again in a moment.' }, 503, corsHeaders);
      return J({ reply: String(reply).slice(0, MAX_CHARS * 2) }, 200, corsHeaders);
    } catch (e) {
      return J({ error: 'Exception: ' + String((e && e.message) || e).slice(0, 150) }, 500, corsHeaders);
    }
  }
};

function J(obj, status, corsHeaders) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json' }, corsHeaders || {}) });
}

function allow(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (list.length >= RATE_LIMIT) { hits.set(ip, list); return false; }
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return true;
}
