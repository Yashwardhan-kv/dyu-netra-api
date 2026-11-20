// FINAL END-TO-END TEST: browser → worker → quick tunnel → local FreeLLMAPI → llm7
const r = await fetch('https://dyunetra-chat.dyunetra-1inlv.workers.dev', {
  method: 'POST',
  headers: { 'Origin': 'https://dyunetra.dpdns.org', 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'What is MEVONU? one sentence' }] })
});
console.log('status:', r.status);
const j = await r.json();
console.log('reply:', (j.reply || JSON.stringify(j)).slice(0, 400));
