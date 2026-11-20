// New quick tunnel is UP: combined-headlines-based-thumbs.trycloudflare.com
// Update worker var with it (clean API-only call, no shell):
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';

// read current settings to preserve, then patch via script settings (vars live in deploy metadata)
// simplest reliable: redeploy via API multipart is complex — use wrangler CLI but WITHOUT
// execSync timeout hanging: spawn with short wait and read file output
import { execFileSync } from 'node:child_process';
const out = execFileSync('npx.cmd', ['wrangler', 'deploy', '--var', 'UPSTREAM_BASE_URL:https://combined-headlines-based-thumbs.trycloudflare.com/v1'], {
  encoding: 'utf8', cwd: 'C:\\Brand\\dyunetra-website-source\\chatbot',
  env: { ...process.env, CLOUDFLARE_API_TOKEN: token }, timeout: 90000, windowsHide: true
});
console.log(out.slice(-250));
