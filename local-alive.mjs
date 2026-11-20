// The live quick tunnel = combined-headlines-based-thumbs (from qt2-err.log, newest connector).
// But fetch to it returned 502 HTML... that's the connector's OWN origin failing:
// cloudflared routes to http://localhost:3001 — is FreeLLMAPI container still up?
import { execSync } from 'node:child_process';
console.log(execSync('docker ps --filter name=freellmapi --format "{{.Names}} {{.Status}}"', { encoding: 'utf8' }));
const r = await fetch('http://localhost:3001/v1/models').catch(e => ({ err: e.message }));
console.log('localhost:', r.err || r.status);
