// Attach custom domains to the worker via the Workers Custom Domains API
// This creates a dedicated edge record that overrides origin routing.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';
const Z = '1a63f4113a47b65288a4c56cbbef5878';

async function api(m, p, b) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${p}`, {
    method: m, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: b ? JSON.stringify(b) : undefined
  });
  return r.json();
}

for (const hostname of ['dyunetra.dpdns.org', 'www.dyunetra.dpdns.org']) {
  const add = await api('PUT', `/accounts/${acc}/workers/domains`, { hostname, service: 'dyunetra-site', environment: 'production', zone_id: Z });
  console.log(hostname, add.success ? 'ATTACHED' : 'FAIL', JSON.stringify(add.errors || []).slice(0, 200));
}
