// Node with the fresh IP + SNI — if TLS works, tunnel serves. Use https module with lookup override.
import https from 'node:https';

function test(ip) {
  return new Promise(resolve => {
    const req = https.get({
      hostname: 'api.freellma.dyunetra.dpdns.org',
      path: '/v1/models',
      servername: 'api.freellma.dyunetra.dpdns.org',
      lookup: (h, o, cb) => cb(null, ip),
      timeout: 15000
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ ip, status: res.statusCode, body: d.slice(0, 150) }));
    });
    req.on('error', e => resolve({ ip, err: e.message.slice(0, 120) }));
  });
}

// try known CF edge IPs
for (const ip of ['172.67.200.41', '104.21.82.103', '188.114.96.7']) {
  const r = await test(ip);
  console.log(JSON.stringify(r));
  if (r.status) break;
}
