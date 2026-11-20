// Set the secret via API directly (clean value, no shell mangling)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';

const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/workers/scripts/dyunetra-chat/secrets`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'UPSTREAM_API_KEY',
    text: 'freellmapi-ddfd4fac01b3617b670acec4c8c34a6fd3353380bf2d7f29',
    type: 'secret_text'
  })
});
const j = await r.json();
console.log(j.success ? 'SECRET SET CLEANLY' : JSON.stringify(j.errors));
