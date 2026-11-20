// CORS smoke test for the deployed chat worker
const r = await fetch('https://dyunetra-chat.dyunetra-1inlv.workers.dev', {
  method: 'POST',
  headers: { 'Origin': 'https://dyunetra.dpdns.org', 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'What is MEVONU?' }] })
});
console.log('status:', r.status);
console.log('cors header:', r.headers.get('access-control-allow-origin'));
const j = await r.json().catch(() => null);
console.log('body:', JSON.stringify(j).slice(0, 300));
