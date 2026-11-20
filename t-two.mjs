// Test tunnel URL directly — first the base /v1/models
const r = await fetch('https://api.freellma.dyunetra.dpdns.org/v1/models').catch(e => ({ err: e.cause?.message || e.message }));
if (r.err) { console.log('models ERR:', r.err); }
else {
  console.log('models status:', r.status);
  console.log('body:', (await r.text()).slice(0, 200));
}
