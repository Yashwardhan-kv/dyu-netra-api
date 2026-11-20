// Tunnel connector up. DNS for api.freellma... may still be cached. Check A record again
import dns from 'node:dns/promises';
dns.setServers(['1.1.1.1']);
const ips = await dns.resolve4('api.freellma.dyunetra.dpdns.org').catch(e => ['ERR:' + e.code]);
console.log('api DNS:', ips.join(','));
const txt = await dns.resolveTxt('dyunetra.dpdns.org').catch(() => []);
console.log('apex TXT count:', txt.length);
