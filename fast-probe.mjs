// Worker appears to HANG on POST. Check if basic GET works (isolate):
const t0 = Date.now();
const r = await fetch('https://dyunetra-chat.dyunetra-1inlv.workers.dev/', {
  method: 'POST',
  headers: { 'Origin': 'https://dyunetra.dpdns.org', 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [] })  // no messages → should return 400 FAST
}).catch(e => ({ err: e.message }));
console.log('empty-messages test | status:', r.status || 'timeout', '| time:', (Date.now() - t0) + 'ms');
const j = await r.json().catch(() => null);
if (j) console.log('body:', JSON.stringify(j).slice(0, 200));
