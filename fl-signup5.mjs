// Signup with FRESH setup code from docker logs (proper ESM, no top-level return)
import { execSync } from 'node:child_process';

const logs = execSync('docker logs freellmapi 2>&1', { encoding: 'utf8' });
const codes = [...new Set([...logs.matchAll(/\b[A-Z0-9]{8,12}\b/g)].map(m => m[0]))];
const code = codes[codes.length - 1];
console.log('using setup code:', code);

await page.fill('input[type=email]', 'admin@dyunetra.dpdns.org');
await page.fill('input[type=password]', 'FreeLLM#2026!');
const fields = await page.locator('input:visible').count();
console.log('visible inputs:', fields);
if (fields >= 3) {
  await page.locator('input:visible').nth(2).fill(code);
}
await page.getByRole('button', { name: /create account/i }).click();
await page.waitForTimeout(10000);
const body = (await page.locator('body').innerText()).slice(0, 700);
await page.screenshot({ path: 'shot-fl-created.png' });
return { url: page.url(), body };
