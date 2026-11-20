import dns from 'node:dns/promises';
import fs from 'node:fs';

// Check resolution via multiple resolvers
dns.setServers(['1.1.1.1']);
const cf = await dns.resolve4('dyunetra.dpdns.org').catch(() => ['fail']);
dns.setServers(['8.8.8.8']);
const gg = await dns.resolve4('dyunetra.dpdns.org').catch(() => ['fail']);
console.log('1.1.1.1:', cf.join(','), '| 8.8.8.8:', gg.join(','));

// HTTPS through whichever
const r = await fetch('https://dyunetra.dpdns.org/').catch(e => ({ err: e.message }));
if (r.err) { console.log('HTTPS err:', r.err.slice(0, 150)); process.exit(0); }
const text = await r.text();
console.log('status:', r.status, '| our site:', /Dyunetra/i.test(text), '| title:', (text.match(/<title>([^<]*)<\/title>/i) || [])[1]);
