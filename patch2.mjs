// "Assistant unavailable" = fetch threw. Workers CAN fetch trycloudflare — unless the
// hostname is too new (DNS propagation at CF's edge resolvers). Force-poll from worker
// impossible; instead add a Worker-side retry isn't the issue. Test DNS from CF's view:
// the quick URL was created ~10 min ago. CF's 1.1.1.1 resolves it fine locally...
// The other suspect: wrangler deploy --var REPLACED wrangler.toml vars, dropping
// ALLOWED_ORIGINS → origin rejection... but error would be 403. We got 502 from catch.
// Node-fetch from my machine to quick URL WORKED. So workers.dev → trycloudflare is
// likely fine. Add error detail to catch:
import fs from 'node:fs';
const p = 'C:\\Brand\\dyunetra-website-source\\chatbot\\worker.js';
let w = fs.readFileSync(p, 'utf8');
w = w.replace("return { error: 'Assistant unavailable. Please try again later.', status: 502 };",
    "return { error: 'Assistant unavailable: ' + (e && e.message ? e.message.slice(0, 80) : 'unknown'), status: 502 };");
fs.writeFileSync(p, w);
console.log('patched');
