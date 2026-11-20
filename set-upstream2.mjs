// Update worker var to the NEW quick tunnel URL and redeploy
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const quickUrl = 'https://quantities-works-marketplace-guided.trycloudflare.com';
const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];

const out = execSync(`npx wrangler deploy --var UPSTREAM_BASE_URL:${quickUrl}`, {
  encoding: 'utf8', cwd: 'C:\\Brand\\dyunetra-website-source\\chatbot',
  env: { ...process.env, CLOUDFLARE_API_TOKEN: token }, timeout: 120000
});
console.log(out.slice(-300));
