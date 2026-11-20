// Node lookup callback signature issue — pass family explicitly
import https from 'node:https';

function test(ip) {
  return new Promise(resolve => {
    const req = https.get({
      hostname: 'api.freellma.dyunetra.dpdns.org',
      path: '/v1/models',
      servername: 'api.freellma.dyunetra.dpdns.org',
      lookup: (host, opts, cb) => { cb(null, ip, 4); },
      timeout: 15000
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ ip, status: res.statusCode, body: d.slice(0, 150) }));
    });
    req.on('error', e => resolve({ ip, err: e.message.slice(0, 120) }));
    req.on('timeout', () => { req.destroy(); resolve({ ip, err: 'timeout' }); });
  });
}

for (const ip of ['172.67.200.41', '104.21.82.103']) {
  const r = await test(ip);
  console.log(JSON.stringify(r));
  if (r.status) break;
}
