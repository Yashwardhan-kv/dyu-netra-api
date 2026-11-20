// fetch failed but DNS resolves — check if it's node's default resolver. Set fetch's dns manually:
import https from 'node:https';

const req = https.get({
  hostname: 'api.freellma.dyunetra.dpdns.org',
  path: '/v1/models',
  timeout: 20000,
  lookup: (host, opts, cb) => cb(null, [{ address: '104.21.82.103', family: 4 }])
}, res => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => console.log('STATUS:', res.statusCode, '| BODY:', d.slice(0, 200)));
});
req.on('error', e => console.log('REQ ERR:', e.message.slice(0, 150)));
