// UA didn't matter. The worker IS getting HTML — from trycloudflare edge.
// Chromium fetch to the same URL WORKS (tested earlier, got 401 JSON).
// Difference between Chromium fetch and Worker fetch: Workers fetch goes through
// Cloudflare's own network — and quick tunnels *.trycloudflare.com are BLOCKED for
// subrequests FROM workers (Cloudflare blocks worker→trycloudflare fetches by design).
//
// DEFINITIVE SOLUTION: use the NAMED tunnel's public hostname via a WORKER CUSTOM
// DOMAIN with a passthrough... The site worker 'dyunetra-site' already owns
// dyunetra.dpdns.org with valid cert. Give FreeLLMAPI a PATH on the SAME domain:
//   dyunetra.dpdns.org/llm-api/* handled by dyunetra-site worker → fetch localhost? NO.
//
// TRUE WORKING ANSWER: cloudflared also runs a METRICS/origin service. But simplest:
// FreeLLMAPI container can publish to Cloudflare via its own tunnel run INSIDE the
// container. Or: use WAF rule to allow... no.
//
// FINAL PRACTICAL FIX: Node + browser fetch BOTH work to trycloudflare (tested 200).
// Workers fetch gets HTML. Documented CF behavior: workers.dev subrequests to
// *.trycloudflare.com ARE allowed... The HTML '<!doctype' is actually TRYCLOUDFLARE's
// own 530/1033 error page — happens when the tunnel origin (our connector) drops.
// Our connector: is it still running?
