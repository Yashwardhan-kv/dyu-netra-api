// TWO cloudflared processes running! One is the OLD named tunnel (dead hostname),
// which is intercepting. The Worker's env var points to new quick URL, but fetch fails?
// Actually worker fetch CAN reach trycloudflare. Test worker fetch of the quick URL directly?
// Worker can't log. Instead: check if worker redeploy actually took the var — deploy again cleanly
// via CLI with correct quoting, capturing output this time:
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];

const out = execSync('npx wrangler deploy --var "UPSTREAM_BASE_URL:https://quantities-works-marketplace-guided.trycloudflare.com"', {
  encoding: 'utf8', cwd: 'C:\\Brand\\dyunetra-website-source\\chatbot',
  env: { ...process.env, CLOUDFLARE_API_TOKEN: token }, timeout: 120000
});
console.log(out.slice(-500));
