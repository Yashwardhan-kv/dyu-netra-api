// Register workers.dev subdomain for the account
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';

// try a subdomain name (must be globally unique — add random suffix)
const sub = 'dyunetra-' + Math.random().toString(36).slice(2, 7);
const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/workers/subdomain`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ subdomain: sub })
});
const j = await r.json();
console.log(JSON.stringify(j, null, 1));
