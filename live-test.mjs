// Actually test HTTPS against the proxy IPs — Cloudflare may already route correctly!
// If 522, proxy misroutes to the DEAD hosting IP (185.27.x). If Pages loads, we're done.
import https from 'node:https';

function get(host, path) {
  return new Promise((resolve) => {
    const req = https.request({ hostname: 'dyunetra.dpdns.org', path, method: 'GET', headers: { Host: 'dyunetra.dpdns.org' }, timeout: 15000 }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, head: d.slice(0, 200) }));
    });
    req.on('error', e => resolve({ err: e.message.slice(0, 100) }));
    req.on('timeout', () => { req.destroy(); resolve({ err: 'timeout' }); });
    req.end();
  });
}

console.log(JSON.stringify(await get('/', 'https://dyunetra.dpdns.org/')));
