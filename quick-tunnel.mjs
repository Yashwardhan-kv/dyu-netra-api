// Add a passthrough worker route: dyunetra.dpdns.org/llm/* → tunnels to local FreeLLMAPI
// via Service Binding to cloudflared's PUBLIC hostname... still cert-blocked.
//
// THE WORKING ANSWER (tested pattern): run `cloudflared tunnel` with a QUICK tunnel
// (`cloudflared tunnel --url http://localhost:3001`) → get https://xxx.trycloudflare.com
// → set that as UPSTREAM_BASE_URL in the chat worker (valid cert, public).
// For stability, register a scheduled check. Start here:
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';

// kill the named-tunnel connector (it's fine to keep; quick tunnel runs alongside on another port? no—
// quick tunnel doesn't conflict)
const child = spawn('C:\\Brand\\cloudflared.exe', ['tunnel', '--url', 'http://localhost:3001', '--protocol', 'http2'], {
  windowsHide: true
});
let url = null;
child.stdout.on('data', d => { const s = d.toString(); fs.appendFileSync('C:\\Brand\\quick-tunnel.log', s); const m = s.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/); if (m && !url) { url = m[0]; console.log('QUICK URL:', url); fs.writeFileSync('C:\\Brand\\quick-url.txt', url); } });
child.stderr.on('data', d => fs.appendFileSync('C:\\Brand\\quick-tunnel.log', d.toString()));

// wait up to 25s for the URL
for (let i = 0; i < 25; i++) {
  if (url) break;
  await new Promise(r => setTimeout(r, 1000));
}
if (!url) { console.log('no url yet; check C:\\Brand\\quick-tunnel.log'); process.exit(1); }
