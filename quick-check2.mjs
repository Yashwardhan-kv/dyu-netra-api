// Is the quick tunnel still alive? And test it directly again:
const quick = 'https://quantities-works-marketplace-guided.trycloudflare.com';
const r = await fetch(quick + '/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: 'Bearer freellmapi-ddfd4fac01b3617b670acec4c8c34a6fd3353380bf2d7f29', 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }], max_tokens: 30 })
}).catch(e => ({ err: (e.cause && e.cause.message) || e.message }));
if (r.err) console.log('quick ERR:', r.err);
else {
  console.log('quick status:', r.status);
  const j = await r.json();
  console.log('reply:', (j.choices?.[0]?.message?.content || JSON.stringify(j)).slice(0, 200));
}
