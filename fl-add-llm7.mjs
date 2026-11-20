// Add llm7 (no API key required) + pollinations as providers
const T = 'c88e2d84289982d9d2dee6c085fb6c9f75a825dd519a9c51980ac811cfd75103';
const H = { Authorization: 'Bearer ' + T, 'Content-Type': 'application/json' };

for (const p of [{ platform: 'llm7', key: 'unused' }, { platform: 'pollinations', key: 'unused' }]) {
  const r = await fetch('http://localhost:3001/api/keys', {
    method: 'POST', headers: H,
    body: JSON.stringify({ platform: p.platform, key: p.key, name: p.platform })
  });
  console.log(p.platform, '→', r.status, (await r.text()).slice(0, 150));
}
