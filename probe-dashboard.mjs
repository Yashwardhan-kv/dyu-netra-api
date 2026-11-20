// FreeLLMAPI dashboard is at localhost:3001/dashboard or similar — discover routes
import fs from 'node:fs';

// read the encryption key we set (the unified API key is derived/shown in dashboard)
const env = fs.readFileSync('C:\\Brand\\freellmapi\\.env', 'utf8');
console.log(env.trim());

// probe common paths
for (const p of ['/', '/dashboard', '/api/keys', '/docs', '/health']) {
  const r = await fetch('http://localhost:3001' + p).catch(e => ({ err: e.message }));
  console.log(p, '→', r.err || r.status);
}
