// verify what public DNS sees now
import https from 'node:https';

function doh(name, type) {
  return new Promise((resolve) => {
    const req = https.get(`https://dns.google/resolve?name=${name}&type=${type}`, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { const j = JSON.parse(d); resolve((j.Answer || []).map(a => a.data)); });
    });
    req.on('error', () => resolve([]));
  });
}

console.log('CNAME root:', await doh('dyunetra.dpdns.org', 'CNAME'));
console.log('A root:', await doh('dyunetra.dpdns.org', 'A'));
console.log('CNAME www:', await doh('www.dyunetra.dpdns.org', 'CNAME'));
