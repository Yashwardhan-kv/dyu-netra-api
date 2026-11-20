// Deeper: TLS to the tunnel hostname to see cert/handshake state
import tls from 'node:tls';
import dns from 'node:dns/promises';

dns.setServers(['1.1.1.1']);
const ips = await dns.resolve4('api.freellma.dyunetra.dpdns.org');
console.log('edge ip:', ips[0]);

const sock = tls.connect({ host: ips[0], port: 443, servername: 'api.freellma.dyunetra.dpdns.org', rejectUnauthorized: false, timeout: 15000 }, () => {
  console.log('TLS OK. Issuer:', JSON.stringify(sock.getPeerCertificate().issuer.O || sock.getPeerCertificate().issuer));
  sock.destroy();
});
sock.on('error', e => console.log('tls err:', e.message.slice(0, 150)));
