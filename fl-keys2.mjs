// Key creation needs a "provider" from that list. Create one key per major free provider,
// then check which providers need upstream keys configured in dashboard settings.
const T = 'c88e2d84289982d9d2dee6c085fb6c9f75a825dd519a9c51980ac811cfd75103';
const H = { Authorization: 'Bearer ' + T, 'Content-Type': 'application/json' };

// try creating a key with provider "freemodel"
const r = await fetch('http://localhost:3001/api/keys', { method: 'POST', headers: H, body: JSON.stringify({ name: 'dyunetra-site', provider: 'freemodel' }) });
console.log('create:', r.status, (await r.text()).slice(0, 400));

// list keys again
const list = await fetch('http://localhost:3001/api/keys', { headers: H }).then(x => x.json());
console.log('keys:', JSON.stringify(list).slice(0, 500));

// provider config endpoints?
for (const p of ['/api/providers/config', '/api/config', '/api/provider-keys', '/api/upstreams']) {
  const x = await fetch('http://localhost:3001' + p, { headers: H }).catch(() => null);
  if (x && x.ok) console.log(p, '→', (await x.text()).slice(0, 200));
}
