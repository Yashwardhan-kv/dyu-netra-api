// Test model=auto through the quick tunnel with the EXACT payload the worker sends:
import https from 'node:https';

const payload = JSON.stringify({
  model: 'auto',
  messages: [
    { role: 'system', content: 'You are Dyunetra Assistant. Be brief.' },
    { role: 'user', content: 'say OK' }
  ],
  max_tokens: 400,
  temperature: 0.4
});

const req = https.request({
  hostname: 'quantities-works-marketplace-guided.trycloudflare.com',
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer freellmapi-ddfd4fac01b3617b670acec4c8c34a6fd3353380bf2d7f29'
  },
  timeout: 30000
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('status:', res.statusCode, '| body:', d.slice(0, 400)));
});
req.on('error', e => console.log('ERR:', e.message.slice(0, 120)));
req.write(payload);
req.end();
