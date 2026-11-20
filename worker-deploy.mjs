// Cloudflare Workers route — create a Worker that serves the site on the custom domain.
// Workers with custom domains take over routing at the edge directly, bypassing origin
// routing entirely. This needs the wrangler OAuth token (has workers permissions).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Use wrangler for everything: deploy dist/ as a Worker with static assets
const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];

// create wrangler.toml for a static-asset worker with custom domain route
const wranglerToml = `
name = "dyunetra-site"
compatibility_date = "2025-01-01"

[assets]
directory = "./dist"

routes = [
  { pattern = "dyunetra.dpdns.org", custom_domain = true },
  { pattern = "www.dyunetra.dpdns.org", custom_domain = true }
]
`;
fs.writeFileSync('wrangler.toml', wranglerToml);

const out = execSync('npx wrangler deploy 2>&1', {
  encoding: 'utf8',
  env: { ...process.env, CLOUDFLARE_API_TOKEN: token },
  timeout: 300000
});
console.log(out);
