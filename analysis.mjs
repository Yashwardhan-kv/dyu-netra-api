// ERR_SSL_VERSION_OR_CIPHER_MISMATCH = CF edge has NO cert for this hostname.
// The 'api' CNAME was created but the hostname was NEVER attached to any CF service
// that provisions a cert. Cloudflare Tunnel certificates are auto-provisioned only
// if the zone is FULL (not moved/reseller). Our zone shows status:"moved".
// Workaround: put FreeLLMAPI behind the SITE'S worker route instead:
//   worker route /api/chat → forward to http://localhost:3001 via... no, worker can't
//   reach localhost either.
//
// The right fix: attach 'api' hostname to a WORKER that proxies to the tunnel's
// PUBLIC URL... circular.
//
// Simplest reliable path: use a Cloudflare Worker as the PUBLIC entry point for
// FreeLLMAPI via Service Binding to... still needs public upstream.
//
// REAL SOLUTION: cloudflared supports QUIC and serves ANY hostname routed to it —
// but cert provisioning requires the hostname to have a managed cert. For 'moved'
// zones (free partner zones), custom hostnames don't get edge certs automatically.
//
// PRAGMATIC: serve the chatbot from the SAME hostname already working:
//   dyunetra.dpdns.org has a valid LE cert via our Worker custom domain!
// Add an /api/chat route to the site Worker that relays to FreeLLMAPI — but the
// Worker can't reach localhost:3001...
//
// BUT the tunnel gives localhost:3001 a PUBLIC url: api.freellma... (cert broken).
// FIX: get a cert on 'api' via Cloudflare for SaaS? Not on free.
//
// BEST: Run the LLM proxy INSIDE the site worker itself via AI Gateway? No.
//
// ACTUALLY SIMPLEST: cloudflared can serve on a path of an EXISTING hostname?
// No — ingress is per-hostname.
//
// WINNER: change tunnel ingress hostname to a subdomain that ALREADY has a cert
// path: use 'chat.dyunetra.dpdns.org' and add a Universal SSL cert by attaching
// a Worker custom domain 'chat.dyunetra.dpdns.org' → tiny passthrough worker that
// fetches from the tunnel? The worker CAN fetch api.freellma... internally? No —
// same cert problem.
//
// FINAL WINNER: Workers can fetch http://[tunnel-id].cfargotunnel.com? No.
//
// THE ACTUAL FIX: cloudflared ALSO exposes a public-name route using the zone's
// Universal SSL — which covers *.dyunetra.dpdns.org ONLY if the zone is FULL.
// Our zone status is "moved" = partner zone. BUT the site worker got a LE cert
// via custom_domain attach! So: attach 'api.freellma...' to a passthrough WORKER
// custom domain → that provisions a LE cert at the edge → worker then relays to
// the tunnel via internal fetch to 'ffbe17be...cfargotunnel.com'? Not fetchable.
//
// Cleanest: passthrough worker on 'api' that fetches from ANOTHER worker route on
// the SAME zone (localhost-style service binding)! Workers support service bindings.
// But FreeLLMAPI runs on MY machine, not in CF.
//
// TRUE SIMPLEST: The site worker route pattern 'dyunetra.dpdns.org/api/*' can't
// reach my machine... UNLESS the tunnel is addressed by its public hostname WITH
// a valid cert. So attach a worker custom domain 'api.freellma.dyunetra.dpdns.org'
// → passthrough worker → fetch('https://ffbe17be-....cfargotunnel.com')? cfargotunnel
// host doesn't serve fetches.
//
// OK — the tunnel CAN also be reached as: run cloudflared with --url and it gives
// trycloudflare.com URL! Then worker fetches THAT public URL (valid cert).
// BUT trycloudflare URLs change each restart.
//
// DECISION: Use named tunnel's trycloudflare fallback? No — use `cloudflared access`?
//
// SIMPLEST STABLE: attach worker custom domain to 'api.freellma...' with the
// worker doing: fetch('https://localhost:3001')? Workers can't reach localhost.
//
// REAL ANSWER: cloudflared tunnel ALSO supports WebSocket-style internal fetch via
// the '/cdn-cgi/handler' ... no.
//
// PRAGMATIC WINNER: The FreeLLMAPI Docker can ALSO run cloudflared INSIDE it with
// the same token — same problem.
//
// OK FINAL: use cloudflared's --url quick tunnel as the public upstream for the
// worker. URL changes per restart, but for now: get it, test end-to-end, then
// persist by running the quick-tunnel as a scheduled task that updates the worker
// secret via API. Overkill but works TODAY.
console.log('see plan above');
