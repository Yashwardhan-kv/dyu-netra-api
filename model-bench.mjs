// "-fast" doesn't exist (7000 No route). ALSO the 34s latency on a 400 means the
// account is being rate-limited/queued on free tier. Try the SMALLER model:
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';

for (const model of ['@cf/qwen/qwen1.5-0.5b-chat', '@cf/meta/llama-2-7b-chat-int8', '@cf/mistral/mistral-7b-instruct-v0.1']) {
  const t0 = Date.now();
  try {
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/ai/run/${model}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'say OK' }], max_tokens: 10 }),
      signal: AbortSignal.timeout(40000)
    });
    const j = await r.json();
    console.log(model, '| status:', r.status, '| latency:', (Date.now() - t0) + 'ms', '| result:', JSON.stringify(j.result || j.errors).slice(0, 120));
  } catch (e) { console.log(model, 'TIMEOUT'); }
}
