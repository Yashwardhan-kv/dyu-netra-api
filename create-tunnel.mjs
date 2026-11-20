// Register a Cloudflare Tunnel + DNS route for FreeLLMAPI
// api.freellma.dyunetra.dpdns.org → local port 3001
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const ACC = 'b6ff9b6177f97bb799b44c67c8f345bf';
const Z = '1a63f4113a47b65288a4c56cbbef5878';

const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACC}/cfd_tunnel`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'freellmapi-tunnel', config_src: 'cloudflare' })
});
const j = await r.json();
if (!j.success) { console.log('tunnel create failed:', JSON.stringify(j.errors)); process.exit(1); }
const { id, token: tunnelToken } = j.result;
console.log('TUNNEL_ID=' + id);
console.log('TUNNEL_TOKEN=' + tunnelToken);
fs.writeFileSync('tunnel-creds.txt', `TUNNEL_ID=${id}\nTUNNEL_TOKEN=${tunnelToken}\n`);

// route DNS
const dns = await fetch(`https://api.cloudflare.com/client/v4/zones/${Z}/dns_records`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'CNAME', name: 'api', content: `${id}.cfargotunnel.com`, proxied: true })
});
const dj = await dns.json();
console.log('DNS route:', dj.success ? 'api.freellma.dyunetra.dpdns.org created' : JSON.stringify(dj.errors));
