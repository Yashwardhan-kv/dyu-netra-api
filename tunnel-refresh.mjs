// Refresh wrangler token then check tunnel
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
try { execSync('npx wrangler whoami', { encoding: 'utf8', timeout: 60000, cwd: 'C:\\Brand\\dyunetra-website-source' }); } catch { }
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';
const tid = 'ffbe17be-bbd5-4b57-a48f-3110326bd457';

async function api(m, p, b) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${p}`, { method: m, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined });
  return r.json();
}

const t = await api('GET', `/accounts/${acc}/cfd_tunnel/${tid}`);
console.log('status:', t.result.status, '| conns:', t.result.connections.length);
const c = await api('GET', `/accounts/${acc}/cfd_tunnel/${tid}/configurations`);
console.log('config:', JSON.stringify(c.result.config));
