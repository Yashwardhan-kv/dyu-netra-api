// Check Pages project domain status
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// find wrangler oauth token
const cfgPath = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
let token = null;
for (const p of [cfgPath, path.join(os.homedir(), '.wrangler', 'config', 'default.toml'), path.join(os.homedir(), 'AppData', 'Roaming', '.wrangler', 'config', 'default.toml')]) {
  if (fs.existsSync(p)) {
    const m = fs.readFileSync(p, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/);
    if (m) { token = m[1]; break; }
  }
}
if (!token) { console.log('NO TOKEN FOUND — files checked:', [cfgPath]); process.exit(1); }

const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';
const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/pages/projects/dyunetra/domains`, {
  headers: { Authorization: `Bearer ${token}` }
});
const j = await r.json();
console.log(JSON.stringify(j.result, null, 1));
