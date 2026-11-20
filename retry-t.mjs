// No conflict at 'api'. TLS alert 40 might be transient CF edge config. Retry now:
const r = await fetch('https://api.freellma.dyunetra.dpdns.org/v1/models').catch(e => ({ err: (e.cause && e.cause.message) || e.message }));
if (r.err) console.log('still err:', r.err);
else { console.log('status:', r.status); console.log('body:', (await r.text()).slice(0, 300)); }
