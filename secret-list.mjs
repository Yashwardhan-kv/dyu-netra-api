// The tunnel works! 401 from FreeLLMAPI: worker sends Authorization: Bearer <secret>
// but our unified key must reach FreeLLMAPI as the USER key. Check how the secret
// was stored — maybe the --text flag wrote it literally? Verify:
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
process.chdir('C:\\Brand\\dyunetra-website-source\\chatbot');
const out = execSync('npx wrangler secret list 2>&1', { encoding: 'utf8', env: { ...process.env, CLOUDFLARE_API_TOKEN: token } });
console.log(out);
