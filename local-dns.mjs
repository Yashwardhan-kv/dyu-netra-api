// The HTTPS request from Node hit "self-signed" — that's the dead hosting IP answering!
// So DNS STILL resolves to 185.27.x for some resolvers. Check both:
import https from 'node:https';
import dns from 'node:dns/promises';

const addrs = await dns.resolve4('dyunetra.dpdns.org').catch(e => ['ERR:' + e.code]);
console.log('local resolver A:', addrs);
const addrs2 = await dns.resolveCname('dyunetra.dpdns.org').catch(() => ['(no cname)']);
console.log('local resolver CNAME:', addrs2);
