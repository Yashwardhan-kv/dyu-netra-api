// SNI handshake failing on free tier = custom-hostname cert unavailable for "moved" zone.
// PIVOT: The quick tunnel (trycloudflare.com) WORKED with a valid cert!
// Named-tunnel + hostname route doesn't. So: run BOTH — keep quick tunnel for the LLM.
// The quick URL changes on restart, but the WORKER reads UPSTREAM_BASE_URL from env —
// updateable via API. For now, set the CURRENT quick URL and ship.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';

const quickUrl = 'https://basement-youth-angels-oops.trycloudflare.com';
// envs are [vars] in wrangler.toml → redeploy with new value via API PATCH settings
// simpler: deploy the worker with the env inline using wrangler CLI in chatbot dir:
const out = execSync('npx wrangler deploy --var UPSTREAM_BASE_URL:' + quickUrl, {
  encoding: 'utf8', cwd: 'C:\\Brand\\dyunetra-website-source\\chatbot',
  env: { ...process.env, CLOUDFLARE_API_TOKEN: token }, timeout: 120000
});
console.log(out.slice(-400));
