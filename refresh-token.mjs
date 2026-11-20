// The OAuth token expired (expires_at passed). Refresh it using wrangler itself —
// running any wrangler command auto-refreshes the token.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const before = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];

try { execSync('npx wrangler whoami', { encoding: 'utf8', timeout: 60000 }); } catch (e) { console.log('whoami out:', (e.stdout || '').slice(0, 200)); }

const after = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
console.log('token refreshed:', before !== after);
