// Compare: which hostname DOES resolve? maybe 'api.freellma' vs 'api'
import dns from 'node:dns/promises';
dns.setServers(['1.1.1.1']);

for (const n of ['api.freellma.dyunetra.dpdns.org', 'api.dyunetra.dpdns.org', 'dyunetra.dpdns.org', 'freellma.dyunetra.dpdns.org']) {
  const a = await dns.resolve4(n).catch(e => ['NO:' + e.code]);
  console.log(n.padEnd(38), a.join(','));
}
