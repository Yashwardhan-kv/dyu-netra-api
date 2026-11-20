// Generate fresh connector token for the tunnel
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import https from 'node:https';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const tok = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';
const tid = 'ffbe17be-bbd5-4b57-a48f-3110326bd457';

const r = https.request({
  hostname: 'api.cloudflare.com',
  path: `/client/v4/accounts/${acc}/cfd_tunnel/${tid}/token`,
  method: 'GET',
  headers: { Authorization: 'Bearer ' + tok }
}, x => {
  let s = '';
  x.on('data', c => s += c);
  x.on('end', () => {
    const j = JSON.parse(s);
    if (j.success) {
      fs.writeFileSync('tunnel-token.txt', j.result);
      console.log('CONNECTOR TOKEN SAVED');
    } else console.log(s.slice(0, 300));
  });
});
r.end();
