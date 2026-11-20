// Poll from multiple public resolvers until all agree on Cloudflare, then verify HTTPS
import https from 'node:https';
import dns from 'node:dns/promises';

dns.setServers(['8.8.8.8', '1.1.1.1']);

for (let i = 0; i < 30; i++) {
  const a = await dns.resolve4('dyunetra.dpdns.org').catch(() => []);
  const cf = a.some(x => x.startsWith('172.66.') || x.startsWith('104.21.'));
  console.log(new Date().toISOString().slice(11, 19), 'A:', a.join(','));
  if (cf) {
    console.log('CF EDGE ACTIVE — verifying HTTPS...');
    const ok = await new Promise(resolve => {
      const req = https.request({ hostname: 'dyunetra.dpdns.org', path: '/', method: 'GET', timeout: 20000 }, res => {
        let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, isSite: d.includes('DYUNETRA') || d.includes('Dyunetra') }));
      });
      req.on('error', e => resolve({ err: e.message.slice(0, 100) }));
      req.end();
    });
    console.log('HTTPS result:', JSON.stringify(ok));
    break;
  }
  await new Promise(r => setTimeout(r, 60000));
}
