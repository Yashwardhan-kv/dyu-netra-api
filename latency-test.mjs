// Measure full response latency — with timeout guard
const t0 = Date.now();
const r = await fetch('https://dyunetra-chat.dyunetra-1inlv.workers.dev', {
  method: 'POST',
  headers: { 'Origin': 'https://dyunetra.dpdns.org', 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
  signal: AbortSignal.timeout(60000)
}).catch(e => ({ err: (e.cause && e.cause.message) || e.message }));
if (r.err) { console.log('ERR:', r.err); process.exit(0); }
const j = await r.json().catch(() => ({}));
console.log('status:', r.status, '| total latency:', (Date.now() - t0) + 'ms');
console.log('reply:', (j.reply || JSON.stringify(j)).slice(0, 200));
