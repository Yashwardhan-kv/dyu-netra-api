// Bench one model at a time (the account seems heavily queued). Try qwen-0.5b (smallest):
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';

const t0 = Date.now();
const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/ai/run/@cf/qwen/qwen1.5-0.5b-chat`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'say OK' }], max_tokens: 10 }),
  signal: AbortSignal.timeout(50000)
}).catch(e => ({ err: (e.cause && e.cause.message) || e.message }));
if (r.err) { console.log('ERR:', r.err); process.exit(0); }
const j = await r.json();
console.log('status:', r.status, '| latency:', (Date.now() - t0) + 'ms');
console.log('result:', JSON.stringify(j.result || j.errors).slice(0, 150));
