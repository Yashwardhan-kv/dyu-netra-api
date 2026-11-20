// Poll Pages domain verification — robust null handling
import https from 'node:https';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const wrToken = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const ACC = 'b6ff9b6177f97bb799b44c67c8f345bf';

function api(p) {
  return new Promise((res, rej) => {
    const r = https.request({ hostname: 'api.cloudflare.com', path: p, method: 'GET', headers: { Authorization: 'Bearer ' + wrToken } }, x => {
      let s = ''; x.on('data', c => s += c); x.on('end', () => res(JSON.parse(s)));
    });
    r.on('error', rej); r.end();
  });
}

for (let i = 0; i < 16; i++) {
  const st = await api(`/client/v4/accounts/${ACC}/pages/projects/dyunetra/domains`);
  const d = st.result && st.result[0];
  if (!d) { console.log(new Date().toISOString().slice(11, 19), 'no domain row', JSON.stringify(st).slice(0, 150)); }
  else {
    const vs = d.verification_data ? d.verification_data.status : '?';
    console.log(new Date().toISOString().slice(11, 19), d.status + '/' + vs);
    if (d.status === 'active') { console.log('DOMAIN ACTIVE'); break; }
  }
  await new Promise(r => setTimeout(r, 30000));
}
