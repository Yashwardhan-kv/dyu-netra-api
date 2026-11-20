// CNAME exists and connector runs in REMOTE-CONFIG mode... but remote config ingress
// was set to api.freellma → localhost:3001 EARLIER (config: True). The 530 says the
// tunnel has NO ingress matching. Re-set remote config now (token was refreshed since):
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';
const tid = 'ffbe17be-bbd5-4b57-a48f-3110326bd457';

const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/cfd_tunnel/${tid}/configurations`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    config: {
      ingress: [
        { hostname: 'api.freellma.dyunetra.dpdns.org', service: 'http://localhost:3001' },
        { service: 'http_status:404' }
      ]
    }
  })
});
const j = await r.json();
console.log('ingress set:', j.success);
