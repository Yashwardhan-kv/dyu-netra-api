// Bypass the UI: call the setup API directly with the code
const code = 'Y4RH7F8RSY';
const r = await fetch('http://localhost:3001/api/auth/setup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@dyunetra.dpdns.org', password: 'FreeLLM#2026!', setupCode: code })
});
console.log('status:', r.status);
console.log('body:', (await r.text()).slice(0, 400));
