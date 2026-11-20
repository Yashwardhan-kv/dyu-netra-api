// Full end-to-end live verification
import dns from 'node:dns/promises';

dns.setServers(['1.1.1.1', '8.8.8.8']);
const a = await dns.resolve4('dyunetra.dpdns.org').catch(() => []);
console.log('A:', a.join(','));

const r = await fetch('https://dyunetra.dpdns.org/', { headers: { 'User-Agent': 'Mozilla/5.0 DyunetraBot/1.0' } });
const text = await r.text();
console.log('HTTPS status:', r.status);
console.log('title:', (text.match(/<title>([^<]*)<\/title>/i) || [])[1]);
console.log('our site:', /Dyunetra|DYUNETRA/i.test(text), '| bytes:', text.length);

const r2 = await fetch('https://www.dyunetra.dpdns.org/');
console.log('www status:', r2.status);
