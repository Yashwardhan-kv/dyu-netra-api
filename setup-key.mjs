// FreeLLMAPI dashboard needs first-run setup — an ADMIN setup key is usually printed
// in docker logs. Get it:
import { execSync } from 'node:child_process';
const logs = execSync('docker logs freellmapi 2>&1', { encoding: 'utf8' });
// find setup/admin/key lines
const lines = logs.split('\n').filter(l => /setup|admin|password|key|token|dashboard|http/i.test(l));
console.log(lines.slice(0, 25).join('\n'));
