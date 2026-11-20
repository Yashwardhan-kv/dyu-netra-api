// POST /api/keys takes a full key object {platform, key, ...}. Also found:
// GET /api/settings/api-key → the UNIFIED KEY! Get it now.
const T = 'c88e2d84289982d9d2dee6c085fb6c9f75a825dd519a9c51980ac811cfd75103';

const uk = await fetch('http://localhost:3001/api/settings/api-key', { headers: { Authorization: 'Bearer ' + T } }).then(r => r.json());
console.log('unified key:', JSON.stringify(uk).slice(0, 300));
