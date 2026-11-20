import dns from 'node:dns/promises';
dns.setServers(['1.1.1.1']);
const ips = await dns.resolve4('api.freellma.dyunetra.dpdns.org').catch(() => []);
console.log('dns:', ips.join(','));
const r = await fetch('https://api.freellma.dyunetra.dpdns.org/v1/models').catch(e => ({ err: (e.cause && e.cause.message) || e.message }));
if (r.err) console.log('fetch err:', r.err);
else { console.log('status:', r.status); console.log('body:', (await r.text()).slice(0, 200)); }
