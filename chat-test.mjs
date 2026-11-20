// Full chat test: unified key → /v1/chat/completions → llm7 provider
const KEY = 'freellmapi-ddfd4fac01b3617b670acec4c8c34a6fd3353380bf2d7f29';

const r = await fetch('http://localhost:3001/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'What is MEVONU? One sentence.' }],
    max_tokens: 100
  })
});
console.log('status:', r.status);
const j = await r.json();
console.log('reply:', JSON.stringify(j).slice(0, 400));
