var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var MAX_MESSAGES = 10;
var MAX_CHARS = 1500;
var RATE_LIMIT = 12;
var WINDOW_MS = 6e4;
var KNOWLEDGE = `You are the Dyunetra Assistant on dyunetra.dpdns.org.
Dyunetra (Dyu-Netra, "eye of the sky") is a technology company founded by Yashwardhan Katkamwar, born from Team Dyunetra \u2014 the Bajaj Institute of Technology team that won Smart India Hackathon 2022 (Software Edition) on IMD/MoES problem statements.
Dyunetra works across cybersecurity, blockchain, AI and IT consulting.
Products:
- MEVONU: Open DFIR Intelligence Platform. Offline-first, AI-assisted digital investigations; every action cryptographically attributable; human-readable rationale. Tagline: Evidence. Intelligence. Integrity.
- QEVRAXIS: Quantum intelligence, adaptive protection, advanced security architecture. Deep-learning network defence (CNN-Bi, trained on CIC-IDS2017, CSE-CIC-IDS2018, UNSW-NB15), real-time monitoring, centralised dashboard. Tagline: Intelligence That Defends. Technology That Evolves.
- DevAI: Secure AI Workforce Platform. Governed AI employees for research, reporting and coding support with approved access, human oversight and auditable execution. Tagline: Your AI workforce, securely in action.
Contact: founder@dyunetra.dpdns.org (also the Contact page). Founder on LinkedIn: yashwardhan-devalyst, GitHub: Yashwardhan-kv.
Rules: Be concise (max ~120 words). Use only facts above or obvious general knowledge. Never invent product features, prices or certifications. Never give attack instructions or malware help. If asked something you do not know, point to the Contact page. Format sparingly with **bold**, *italic* and links.`;
var hits = /* @__PURE__ */ new Map();
var worker_default = {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const corsOk = origin && allowed.includes(origin);
    const corsHeaders = corsOk ? { "Access-Control-Allow-Origin": origin } : {};
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: corsOk ? 204 : 403,
        headers: {
          ...corsHeaders,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        }
      });
    }
    if (request.method !== "POST") return jsonResponse({ error: "POST only" }, 405, corsHeaders);
    if (!corsOk) return jsonResponse({ error: "Origin not allowed" }, 403, corsHeaders);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (!allow(ip)) return jsonResponse({ error: "Too many requests. Try again shortly." }, 429, corsHeaders);
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400, corsHeaders);
    }
    const msgs = Array.isArray(body.messages) ? body.messages : [];
    const clean = [];
    for (const m of msgs.slice(-MAX_MESSAGES)) {
      if (!m || typeof m.content !== "string") continue;
      clean.push({ role: m.role === "assistant" ? "assistant" : "user", content: m.content.slice(0, MAX_CHARS) });
    }
    if (!clean.length || clean[clean.length - 1].role !== "user")
      return jsonResponse({ error: "No user message" }, 400, corsHeaders);
    const upstream = await callUpstream(env, clean);
    const out = upstream.error ? { error: upstream.error } : { reply: upstream.reply };
    return jsonResponse(out, upstream.error ? upstream.status || 502 : 200, corsHeaders);
  }
};
function allow(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= RATE_LIMIT) {
    hits.set(ip, list);
    return false;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5e3) hits.clear();
  return true;
}
__name(allow, "allow");
function jsonResponse(obj, status, corsHeaders) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
}
__name(jsonResponse, "jsonResponse");
async function callUpstream(env, messages, origin) {
  const base = (env.UPSTREAM_BASE_URL || "").replace(/\/+$/, "");
  if (!base || base.includes("CHANGE-ME") || base.includes("YOUR-FREELLMAPI-HOST"))
    return { error: "Assistant is not configured yet. Please use the Contact page.", status: 503, _cors: origin };
  const payload = {
    model: env.MODEL || env.UPSTREAM_MODEL || "default",
    messages: [{ role: "system", content: KNOWLEDGE }, ...messages],
    max_tokens: 400,
    temperature: 0.4
  };
  try {
    const r = await fetch(base + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.UPSTREAM_API_KEY || ""}` },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      const t = await r.text();
      return { error: "Assistant upstream error (" + r.status + "). Please try the Contact page.", status: 502 };
    }
    const j = await r.json();
    const reply = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    if (!reply) return { error: "Empty reply", status: 502 };
    return { reply: String(reply).slice(0, MAX_CHARS * 2) };
  } catch {
    return { error: "Assistant unavailable: " + (e && e.message ? e.message.slice(0, 80) : "unknown"), status: 502 };
  }
}
__name(callUpstream, "callUpstream");
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
