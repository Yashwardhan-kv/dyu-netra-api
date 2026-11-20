// Explore FreeLLMAPI: what endpoints exist? Use the auth token.
const T = 'c88e2d84289982d9d2dee6c085fb6c9f75a825dd519a9c51980ac811cfd75103';

for (const p of ['/api/keys', '/api/providers', '/api/settings', '/api/status', '/api/v1/keys', '/api/dashboard']) {
  const r = await fetch('http://localhost:3001' + p, { headers: { Authorization: 'Bearer ' + T } }).catch(e => ({ err: e.message }));
  if (r.err) { console.log(p, 'ERR'); continue; }
  const t = await r.text();
  console.log(p, '→', r.status, t.slice(0, 150));
}
