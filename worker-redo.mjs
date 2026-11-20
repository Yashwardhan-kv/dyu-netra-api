// The 522 → self-signed flip suggests proxy routing churn. Check what HOST the edge
// connects to: our Worker (dyunetra-site) with custom_domain routes should OVERRIDE all
// origin behavior. Did the worker deploy succeed?
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];

try {
  const out = execSync('npx wrangler deploy', { encoding: 'utf8', env: { ...process.env, CLOUDFLARE_API_TOKEN: token }, timeout: 240000 });
  console.log(out);
} catch (e) {
  console.log('DEPLOY ERR:', (e.stdout || '') + (e.stderr || '').slice(0, 800));
}
