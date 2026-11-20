// Re-run csr-extract and dump the full raw output to a file for PEM extraction
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const out = execSync('node "C:\\Users\\dell\\.codegpt\\skills\\browser-automation\\browser.mjs" --session cpanel --script ./csr-extract.mjs', { encoding: 'utf8' });
fs.writeFileSync('raw-csr.txt', out);
console.log('written, size', out.length);
