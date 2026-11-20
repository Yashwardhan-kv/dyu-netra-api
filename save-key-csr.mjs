// Extract key + CSR from the panel and save locally
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const out = execSync('node "C:\\Users\\dell\\.codegpt\\skills\\browser-automation\\browser.mjs" --session cpanel --script ./csr-extract.mjs', { encoding: 'utf8' });
const scriptMatch = out.match(/script\s+(\{[\s\S]*?\})\nconsole errors/);
if (!scriptMatch) { console.error('cannot parse output'); process.exit(1); }
const obj = JSON.parse(scriptMatch[1]);
fs.writeFileSync('server.key', obj.key);
fs.writeFileSync('server.csr', obj.csr);
console.log('saved server.key (' + obj.key.length + ' chars) and server.csr (' + obj.csr.length + ' chars)');
