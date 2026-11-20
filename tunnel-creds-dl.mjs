// Download tunnel credentials JSON so cloudflared can provision certs properly
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';
const tid = 'ffbe17be-bbd5-4b57-a48f-3110326bd457';

const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/cfd_tunnel/${tid}`, { headers: { Authorization: `Bearer ${token}` } }).then(x => x.json());
if (r.success) {
  const creds = JSON.stringify({ AccountTag: acc, TunnelSecret: r.result.tunnel_secret || r.result.credentials, TunnelID: tid });
  fs.writeFileSync('C:\\Brand\\tunnel-creds.json', creds);
  console.log('creds file written');
} else console.log('err:', JSON.stringify(r.errors || r).slice(0, 200));
