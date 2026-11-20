// Email routing check via wrangler OAuth token (more scopes)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const Z = '1a63f4113a47b65288a4c56cbbef5878';

const st = await fetch(`https://api.cloudflare.com/client/v4/zones/${Z}/email/routing`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
console.log('routing status:', JSON.stringify(st.result || st.errors).slice(0, 300));

const addr = await fetch(`https://api.cloudflare.com/client/v4/zones/${Z}/email/routing/addresses`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
console.log('destinations:', JSON.stringify(addr.result || addr.errors).slice(0, 300));

const rules = await fetch(`https://api.cloudflare.com/client/v4/zones/${Z}/email/routing/rules`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
console.log('rules:', JSON.stringify(rules.result || rules.errors).slice(0, 500));
