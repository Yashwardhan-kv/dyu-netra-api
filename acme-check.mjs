// Get a Let's Encrypt certificate via zeroSSL-style API? No — use ACME directly.
// Simpler: use the public https://gethttpsforfree.com style manual flow is interactive.
// Instead: run a tiny ACME client with HTTP-01 using our FTP to place challenge files.
// Node has no built-in ACME client; use 'acme-client' npm package if available.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const hasPkg = fs.existsSync('node_modules/acme-client');
console.log('acme-client installed:', hasPkg);
if (!hasPkg) process.exit(2);
