// Named-tunnel hostname still lacks edge cert (moved zone). FALLBACK LOCKED IN:
// quick tunnel works reliably. Make it resilient: a script that (1) starts quick
// tunnel, (2) grabs URL, (3) updates the WORKER secret/var via API, (4) writes to
// a log. Run it via Task Scheduler or manually when needed. For NOW: restart quick
// tunnel, update worker, verify chat works end-to-end again.
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';

execSync('powershell -NoProfile -ExecutionPolicy Bypass -File C:\\Brand\\clean-quick.ps1', { encoding: 'utf8', timeout: 60000 });
const url = fs.readFileSync('C:\\Brand\\quick-url-cache.txt', 'utf8').trim() ||
  (execSync('powershell -NoProfile -Command "(Select-String -Path \'C:\\Brand\\qt3-out.log\',\'C:\\Brand\\qt3-err.log\' -Pattern \'https://[a-z0-9-]+\\.trycloudflare\\.com\' | Select-Object -First 1).Matches[0].Value"', { encoding: 'utf8' }).trim());
console.log('quick url:', url);
fs.writeFileSync('C:\\Brand\\quick-url-cache.txt', url);

// update worker var via wrangler CLI in chatbot dir with fresh oauth token
const cfg = 'C:\\Users\\dell\\AppData\\Roaming\\xdg.config\\.wrangler\\config\\default.toml';
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const out = execSync(`npx wrangler deploy --var "UPSTREAM_BASE_URL:${url}/v1"`, {
  encoding: 'utf8', cwd: 'C:\\Brand\\dyunetra-website-source\\chatbot',
  env: { ...process.env, CLOUDFLARE_API_TOKEN: token }, timeout: 120000
});
console.log(out.slice(-200));
