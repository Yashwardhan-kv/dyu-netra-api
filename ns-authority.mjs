// Diagnostic: which NS is authoritative RIGHT NOW (some TLD caches lag)?
import dns from 'node:dns/promises';
import tls from 'node:tls';

dns.setServers(['8.8.8.8', '1.1.1.1']);
const ns = await dns.resolveNs('dyunetra.dpdns.org').catch(e => ['ERR:' + e.code]);
console.log('NS records now:', ns.join(','));

const soa = await dns.resolveSoa('dyunetra.dpdns.org').catch(() => null);
if (soa) console.log('SOA primary:', soa.nsname);

// query each NS directly for A record of apex
const results = {};
for (const server of ns.filter(n => !n.startsWith('ERR'))) {
  dns.setServers([server]);
  const a = await dns.resolve4('dyunetra.dpdns.org').catch(e => ['ERR ' + e.code]);
  results[server] = a.join(',');
  console.log('A via', server, '→', a.join(','));
}
