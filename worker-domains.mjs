// DNS is CORRECT (CF edge IPs). TLS alert 40 from Node... but the tunnel is healthy.
// The issue: CF edge expects the RIGHT SNI + the hostname must be in the tunnel's
// cert domain set. Our Worker custom-domain attach for 'api' earlier may conflict.
// List worker domains to check:
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';

const d = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/workers/domains`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
for (const x of d.result || []) console.log(x.hostname, '→', x.service);
