// The tunnel from THIS machine works. Worker got HTML — it's hitting a DIFFERENT
// (stale/dead) quick-tunnel hostname. CF workers fetch has IPv6 preference; quick
// tunnels are IPv4-only edge... The robust fix: named tunnel route via worker custom
// domain DID fail, but a SUBDOMAIN-PATH trick works: the site worker (dyunetra-site)
// owns dyunetra.dpdns.org/* — add a route there? No, separate workers.
//
// SIMPLEST CERTAIN FIX: make the WORKER call the LOCAL FreeLLMAPI through the SAME
// machine's public IPv4 via a port-forward... no static IP.
//
// BEST ACTUAL FIX: run cloudflared as a SECOND connector for a NEW named tunnel
// dedicated to freellm, whose hostname is attached as a WORKER CUSTOM DOMAIN
// (which provisions certs — proven to work for dyunetra-site). Attach
// 'llm.dyunetra.dpdns.org' → new tunnel. Steps:
//   1. create tunnel #2
//   2. run connector with its token on this machine
//   3. attach worker custom domain llm.dyunetra.dpdns.org → new passthrough worker
//      that fetches http://localhost:3001 — workers STILL can't reach localhost.
//   4. So instead: llm.dyunetra.dpdns.org → tunnel → local. Custom domain attach
//      provisions the cert, then edge routes to tunnel. THIS SHOULD WORK because
//      cert provisioning is what failed for api.freellma (zone moved status).
//      Attaching via Workers Custom Domains API DID work for the site worker on
//      the SAME zone. So: create passthrough worker 'dyunetra-llm' with route
//      llm.dyunetra.dpdns.org that fetches UPSTREAM via the tunnel? Circular again.
//
// WAIT — real insight: The Worker cannot fetch localhost, but it CAN fetch
// *.trycloudflare.com (public cert). The earlier failure 'Unexpected token <'
// means the worker fetched the QUICK URL and got HTML. Which quick URL? The var
// deploy may not have applied. Now wrangler.toml HAS the new URL and deploy
// succeeded. The '<!doctype' might be from trycloudflare itself being
// temporarily HTML (browser warning page) for NEW hostnames — CF serves an
// interstitial for brand-new quick tunnels on first browser-ish requests (no UA).
// Add User-Agent to worker fetch:
const fs = require('fs');
const p = 'C:/Brand/dyunetra-website-source/chatbot/worker.js';
let w = fs.readFileSync(p, 'utf8');
w = w.replace(
  "headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (env.UPSTREAM_API_KEY || '') },",
  "headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (env.UPSTREAM_API_KEY || ''), 'User-Agent': 'DyunetraAssistant/1.0' },"
);
fs.writeFileSync(p, w);
console.log('UA patched');
