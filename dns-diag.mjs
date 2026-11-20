// Check what the Pages validator actually sees, then fix DNS accordingly
import https from 'node:https';

function dnsQuery(host, path) {
  return new Promise((resolve) => {
    const req = https.get(`https://${host}${path}`, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', () => resolve({}));
  });
}

const root = await dnsQuery('dns.google', '/resolve?name=dyunetra.dpdns.org&type=CNAME');
const rootA = await dnsQuery('dns.google', '/resolve?name=dyunetra.dpdns.org&type=A');
console.log('CNAME answers:', JSON.stringify((root.Answer || []).map(a => a.data)));
console.log('A answers:', JSON.stringify((rootA.Answer || []).map(a => a.data)));
