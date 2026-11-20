// Test tunnel: https://api.freellma.dyunetra.dpdns.org/v1/models via Node fetch
const r = await fetch('https://api.freellma.dyunetra.dpdns.org/v1/models', { timeout: 25000 }).catch(e => ({ err: e.message }));
if (r.err) { console.log('ERR:', r.err.slice(0, 150)); process.exit(0); }
console.log('STATUS:', r.status);
const t = await r.text();
console.log('BODY:', t.slice(0, 200));
