// Get the exact tunnel URL from the log (maybe different than guessed)
const log = require('fs').readFileSync('C:\\Brand\\quick-tunnel.log', 'utf8');
const urls = [...log.matchAll(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/g)].map(m => m[0]);
console.log('urls found:', [...new Set(urls)]);
