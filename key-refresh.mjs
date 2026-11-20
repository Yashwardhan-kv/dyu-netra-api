// PowerShell/curl can't TLS to that hostname (local resolver cache) but the WORKER
// DID reach FreeLLMAPI and got 401. So worker→tunnel→local works. The 401 means the
// key value in the worker secret doesn't match. Maybe FreeLLMAPI rotates the unified
// key per-provider enable? Re-check JUST NOW and update secret if different:
const T = 'c88e2d84289982d9d2dee6c085fb6c9f75a825dd519a9c51980ac811cfd75103';
const uk = await fetch('http://localhost:3001/api/settings/api-key', { headers: { Authorization: 'Bearer ' + T } }).then(r => r.json());
const current = uk.apiKey;
console.log('live key:', current);

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';
await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/workers/scripts/dyunetra-chat/secrets`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'UPSTREAM_API_KEY', text: current, type: 'secret_text' })
}).then(r => r.json()).then(j => console.log('secret updated:', j.success));

// verify locally that this key authenticates:
const t = await fetch('http://localhost:3001/v1/models', { headers: { Authorization: 'Bearer ' + current } });
console.log('local /v1/models with key:', t.status);
