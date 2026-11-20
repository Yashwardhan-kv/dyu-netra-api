// Raw response dump (500 = HTML error page from worker crash — likely a syntax/runtime error)
const r = await fetch('https://dyunetra-chat.dyunetra-1inlv.workers.dev', {
  method: 'POST',
  headers: { 'Origin': 'https://dyunetra.dpdns.org', 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] })
});
console.log('status:', r.status);
const t = await r.text();
console.log('RAW:', t.slice(0, 500));
