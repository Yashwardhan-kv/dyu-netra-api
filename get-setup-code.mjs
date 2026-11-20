// Extract the setup code from docker logs
import { execSync } from 'node:child_process';
const logs = execSync('docker logs freellmapi 2>&1', { encoding: 'utf8' });
// Look for a short code (6-8 alphanumeric) near "setup"
const matches = [...logs.matchAll(/setup[^\n]*?([A-Z0-9]{6,10})/gi)];
console.log('candidates:', matches.map(m => m[1]));
// also dump last 20 lines for manual reading
console.log('---last 20---');
console.log(logs.split('\n').slice(-20).join('\n'));
