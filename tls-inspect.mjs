import dns from 'node:dns/promises';
import tls from 'node:tls';

dns.setServers(['1.1.1.1']);
const addrs = await dns.resolve4('dyunetra.dpdns.org');

// TLS handshake to see WHICH certificate is served
const sock = tls.connect({ host: addrs[0], port: 443, servername: 'dyunetra.dpdns.org', rejectUnauthorized: false, timeout: 15000 }, () => {
  const cert = sock.getPeerCertificate();
  console.log('ISSUER:', JSON.stringify(cert.issuer));
  console.log('SUBJECT:', JSON.stringify(cert.subject));
  console.log('VALID:', cert.valid_from, '→', cert.valid_to);
  sock.end();
});
sock.on('error', e => console.log('tls err:', e.message.slice(0, 120)));
