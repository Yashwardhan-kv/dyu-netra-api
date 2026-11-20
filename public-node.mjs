// Node's DNS works where PowerShell's didn't — test full HTTPS via Node
import https from 'node:https';

const req = https.get('https://api.freellma.dyunetra.dpdns.org/v1/models', { timeout: 20000 }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('STATUS:', res.statusCode, '| BODY:', d.slice(0, 150)));
});
req.on('error', e => console.log('ERR:', e.message.slice(0, 150)));
