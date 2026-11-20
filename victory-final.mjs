// FULL END-TO-END: browser-origin → chat worker → tunnel → FreeLLMAPI → llm7
const r = await fetch('https://dyunetra-chat.dyunetra-1inlv.workers.dev', {
  method: 'POST',
  headers: { 'Origin': 'https://dyunetra.dpdns.org', 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'What is MEVONU? Answer in one sentence.' }] })
});
console.log('status:', r.status);
console.log('acao:', r.headers.get('access-control-allow-origin'));
const j = await r.json();
console.log('REPLY:', (j.reply || JSON.stringify(j)).slice(0, 400));
