// Check what the Pages domain verification needs — use "quick" approach:
// Cloudflare Pages auto-detects domains IN THE SAME ACCOUNT/ZONE. Since our zone IS in
// the same account, the "CNAME record" requirement can be satisfied by the zone-level
// integration. The proper method: re-add domain, and Pages creates its own internal
// CNAME automatically when the zone is in-account.
// Test: delete + re-add the domain record in Pages project.
import https from 'node:https';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const wrToken = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const ACC = 'b6ff9b6177f97bb799b44c67c8f345bf';

function api(m, p, b) {
  return new Promise((res, rej) => {
    const d = b ? JSON.stringify(b) : null;
    const r = https.request({ hostname: 'api.cloudflare.com', path: p, method: m, headers: { Authorization: 'Bearer ' + wrToken, 'Content-Type': 'application/json' } }, x => {
      let s = ''; x.on('data', c => s += c); x.on('end', () => res(JSON.parse(s)));
    });
    r.on('error', rej); if (d) r.write(d); r.end();
  });
}

// delete existing domain entry
const del = await api('DELETE', `/client/v4/accounts/${ACC}/pages/projects/dyunetra/domains/dyunetra.dpdns.org`);
console.log('deleted:', del.success);
await new Promise(r => setTimeout(r, 3000));
// re-add
const add = await api('POST', `/client/v4/accounts/${ACC}/pages/projects/dyunetra/domains`, { name: 'dyunetra.dpdns.org' });
console.log('re-added:', add.success, JSON.stringify(add.result || add.errors).slice(0, 300));
