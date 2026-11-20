// Tunnel HEALTHY + correct config. TLS alert 40 might be DNS caching the OLD record
// (Worker 'api' A-record from earlier) at the system/browser resolver. Test with fresh DNS:
import dns from 'node:dns/promises';
dns.setServers(['1.1.1.1', '8.8.8.8']);
const ips = await dns.resolve4('api.freellma.dyunetra.dpdns.org').catch(e => ['ERR:' + e.code]);
console.log('fresh DNS:', ips.join(','));

// If CF edge IPs → fetch through them via fetch() with Host override? fetch won't allow.
// Instead test in-browser (chromium DNS) — browser engine refreshes its own cache.
