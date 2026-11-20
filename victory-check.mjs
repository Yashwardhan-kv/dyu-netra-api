// THE definitive end-to-end test
const r = await fetch('https://dyunetra-chat.dyunetra-1inlv.workers.dev', {
  method: 'POST',
  headers: { 'Origin': 'https://dyunetra.dpdns.org', 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'What is MEVONU? answer in one sentence' }] })
});
console.log('status:', r.status);
const j = await r.json();
console.log('REPLY:', (j.reply || JSON.stringify(j)).slice(0, 400));
