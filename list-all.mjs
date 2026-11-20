// List ALL workers in the account + their domains (find where dyunetra-site landed)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cfg = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(cfg, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const acc = 'b6ff9b6177f97bb799b44c67c8f345bf';

const scripts = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/workers/scripts`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
console.log('workers:', JSON.stringify((scripts.result || []).map(s => s.id)));

const domains = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/workers/domains`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
console.log('all worker domains:', JSON.stringify((domains.result || []).map(d => ({ hostname: d.hostname, service: d.service })), null, 1));

// pages projects too
const pages = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/pages/projects`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
console.log('pages projects:', JSON.stringify((pages.result || []).map(p => ({ name: p.name, domains: p.domains, subdomain: p.subdomain })), null, 1));
