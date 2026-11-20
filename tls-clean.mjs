// Strict TLS to 1.1.1.1-resolved IP with SNI — which cert does a CLEAN resolver get?
import tls from 'node:tls';
import dns from 'node:dns/promises';

dns.setServers(['1.1.1.1']);
const addrs = await dns.resolve4('dyunetra.dpdns.org').catch(() => ['(none)']);
console.log('1.1.1.1 says A =', addrs.join(','));

const sock = tls.connect({ host: addrs[0] || 'dyunetra.dpdns.org', port: 443, servername: 'dyunetra.dpdns.org', rejectUnauthorized: false, timeout: 15000 }, () => {
  const cert = sock.getPeerCertificate();
  console.log('ISSUER:', JSON.stringify(cert.issuer));
  console.log('VALID TO:', cert.valid_to);
  sock.destroy();
});
sock.on('error', e => console.log('tls err:', e.message.slice(0, 120)));
