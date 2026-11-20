// Is the key EXACTLY right? Compare hash of what we set vs what FreeLLMAPI expects.
// FreeLLMAPI may hash/unify keys. Check /api/settings/api-key again & use THAT value:
const T = 'c88e2d84289982d9d2dee6c085fb6c9f75a825dd519a9c51980ac811cfd75103';
const uk = await fetch('http://localhost:3001/api/settings/api-key', { headers: { Authorization: 'Bearer ' + T } }).then(r => r.json());
console.log('current unified key:', uk.apiKey);
// Also list ALL keys to see if the unified one changed:
const keys = await fetch('http://localhost:3001/api/keys', { headers: { Authorization: 'Bearer ' + T } }).then(r => r.json());
console.log('keys list:', JSON.stringify(keys).slice(0, 600));
