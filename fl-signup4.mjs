// Signup with the FRESH setup code pulled from docker logs at runtime
import { execSync } from 'node:child_process';

const logs = execSync('docker logs freellmapi 2>&1', { encoding: 'utf8' });
// codes appear near "setup" lines; take the LAST one
const codes = [...logs.matchAll(/\b[A-Z0-9]{8,12}\b/g)].map(m => m[0]);
console.log('all codes seen:', [...new Set(codes)].slice(-5));

await page.fill('input[type=email]', 'admin@dyunetra.dpdns.org');
await page.fill('input[type=password]', 'FreeLLM#2026!');
const fields = await page.locator('input:visible').count();
console.log('visible inputs:', fields);
// third input (if present) = setup code
if (fields >= 3) {
  await page.locator('input:visible').nth(2).fill(codes[codes.length - 1]);
}
await page.getByRole('button', { name: /create account/i }).click();
await page.waitForTimeout(10000);
const body = (await page.locator('body').innerText()).slice(0, 700);
await page.screenshot({ path: 'shot-fl-created.png' });
return { url: page.url(), body };
