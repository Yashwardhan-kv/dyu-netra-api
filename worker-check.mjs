// check worker deploy output and DNS state
import { execSync } from 'node:child_process';
import dns from 'node:dns/promises';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];

// list workers
try {
  const out = execSync('npx wrangler deployments list 2>&1', { encoding: 'utf8', env: { ...process.env, CLOUDFLARE_API_TOKEN: token }, timeout: 60000 });
  console.log(out.slice(0, 800));
} catch (e) { console.log('deploy list err:', e.message.slice(0, 300)); }

const a = await dns.resolve4('dyunetra.dpdns.org').catch(() => []);
console.log('A now:', a.join(','));
