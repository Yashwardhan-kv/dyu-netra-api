// Connector IS running and PUBLIC fetch works (200). Worker still gets HTML.
// Cloudflare Workers fetching *.trycloudflare.com — there IS a known block:
// workers cannot subrequest to cloudflare-owned zones from free plans (loop risk).
// trycloudflare.com IS a cloudflare zone → BLOCKED. That's the HTML (CF block page).
//
// THE REAL FIX: named tunnel hostname on our OWN zone (dyunetra.dpdns.org).
// Worker fetch to dyunetra.dpdns.org = same-zone fetch → ALLOWED (loop protection
// passes with fetch following properly or using the 'cf' resolve override).
// So: attach 'llm.dyunetra.dpdns.org' as custom domain to the SITE worker? No —
// we need the tunnel, not the worker.
//
// Sequence that WILL work:
// 1. cloudflared named-tunnel connector already registered route api.freellma...
// 2. Attach 'api.freellma...' as WORKER CUSTOM DOMAIN → dyunetra-site? That would
//    intercept... but then site-worker route '/llm/*'... messy.
//
// CLEANEST: site worker 'dyunetra-site' gets a NEW route path: dyunetra.dpdns.org/llm/*
// handled INSIDE dyunetra-site worker → fetch('https://api.freellma...') — still cert.
//
// Hmm. But wait: worker-fetch to SAME-ZONE hostnames is allowed and uses internal
// routing (no TLS to edge needed for same-zone? Actually fetch to same zone hostname
// from a worker on that zone = loop, blocked unless /cdn-cgi/... no—)
//
// DEFINITIVE TEST NEEDED: does worker fetch to https://api.freellma... (our zone,
// tunnel route) work? Deploy test endpoint into dyunetra-chat that fetches it:
