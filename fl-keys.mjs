// /api/keys exists (empty). Create an API key via POST, and check /api docs for provider config
const T = 'c88e2d84289982d9d2dee6c085fb6c9f75a825dd519a9c51980ac811cfd75103';
const H = { Authorization: 'Bearer ' + T, 'Content-Type': 'application/json' };

// create key
let r = await fetch('http://localhost:3001/api/keys', { method: 'POST', headers: H, body: JSON.stringify({ name: 'dyunetra-site' }) }).catch(e => ({ err: e.message }));
console.log('POST /api/keys:', r.err || r.status, r.err ? '' : (await r.text()).slice(0, 300));

// check what POST expects — try OpenAPI / swagger json
for (const p of ['/api-docs', '/swagger.json', '/api/openapi.json', '/docs/json']) {
  const d = await fetch('http://localhost:3001' + p).catch(() => null);
  if (d && d.ok) { console.log(p, '→', (await d.text()).slice(0, 400)); break; }
}
