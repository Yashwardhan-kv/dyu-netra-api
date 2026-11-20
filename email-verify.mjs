// Verify email routing is live again
import https from 'node:https';
import dns from 'node:dns/promises';

dns.setServers(['1.1.1.1']);
const txt = await dns.resolveTxt('dyunetra.dpdns.org').catch(e => ['ERR']);
console.log('TXT:', JSON.stringify(txt).slice(0, 300));

const cfTxt = await dns.resolveTxt('_mailcf.dyunetra.dpdns.org').catch(e => ['(none)']);
console.log('mailcf TXT:', JSON.stringify(cfTxt).slice(0, 150));

const mx = await dns.resolveMx('dyunetra.dpdns.org').catch(e => ['ERR']);
console.log('MX:', JSON.stringify(mx).slice(0, 200));
