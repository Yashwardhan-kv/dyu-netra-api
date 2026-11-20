// Resolve NS hostnames to IPs, query each authoritative NS directly for the apex A
import dns from 'node:dns/promises';
import tls from 'node:tls';

dns.setServers(['8.8.8.8', '1.1.1.1']);
const nsHosts = await dns.resolveNs('dyunetra.dpdns.org');
const results = {};
for (const host of nsHosts) {
  const ips = await dns.resolve4(host).catch(() => []);
  if (!ips.length) continue;
  dns.setServers([ips[0]]);
  const a = await dns.resolve4('dyunetra.dpdns.org').catch(e => ['ERR:' + e.code]);
  results[host] = a.join(',');
  console.log('A via', host, '→', a.join(','));
}
dns.setServers(['8.8.8.8', '1.1.1.1']);

// If Cloudflare NS answers with edge IPs, do the full HTTPS check
const allA = Object.values(results).flat();
const isCF = allA.some(x => x.startsWith('172.66.') || x.startsWith('104.21.'));
console.log('all CF edge?', isCF);

if (isCF) {
  const r = await fetch('https://dyunetra.dpdns.org/');
  const text = await r.text();
  console.log('HTTPS status:', r.status, '| our site:', /Dyunetra/i.test(text), '| title:', (text.match(/<title>([^<]*)<\/title>/i) || [])[1]);
} else {
  console.log('One or more NS still serving the old hosting IP — waiting more.');
}
