// FreeLLMAPI healthy again. Test through quick tunnel from Node:
const KEY = 'freellmapi-ddfd4fac01b3617b670acec4c8c34a6fd3353380bf2d7f29';
const r = await fetch('https://combined-headlines-based-thumbs.trycloudflare.com/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'say READY' }], max_tokens: 10 })
}).catch(e => ({ err: (e.cause && e.cause.message) || e.message }));
if (r.err) console.log('ERR:', r.err);
else console.log('status:', r.status, '| body:', (await r.text()).slice(0, 200));
