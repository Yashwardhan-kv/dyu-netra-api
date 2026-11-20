// Check workers + routes state
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const Z = '1a63f4113a47b65288a4c56cbbef5878';

// zone-level routes (workers routes can be shadowed by DNS records)
const routes = await fetch(`https://api.cloudflare.com/client/v4/zones/${Z}/workers/routes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
console.log('zone worker routes:', JSON.stringify(routes.result, null, 1));

// list custom domains attached to our worker
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';
const cds = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/workers/domains?worker_name=dyunetra-site`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
console.log('worker custom domains:', JSON.stringify(cds.result, null, 1));
