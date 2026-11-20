export default async function run(page, ui) {
  // Setup code field exists AFTER selecting "Setup code" reveal — the 403 says the
  // code was wrong/missing. Get fresh code from docker logs each attempt.
  import('./get-code-fresh.mjs');
  const logs = require('node:child_process').execSync('docker logs freellmapi 2>&1 | findstr /i "setup code"', { encoding: 'utf8', shell: 'cmd' });
  const codes = [...logs.matchAll(/[A-Z0-9]{8,12}/g)].map(m => m[0]);
  console.log('codes found:', codes);
  const code = codes[codes.length - 1];

  await page.fill('input[type=email]', 'admin@dyunetra.dpdns.org');
  await page.fill('input[type=password]', 'FreeLLM#2026!');
  const codeField = page.locator('input').nth(2);
  if (await codeField.count()) { await codeField.fill(code); }
  await page.getByRole('button', { name: /create account/i }).click();
  await page.waitForTimeout(10000);
  const body = (await page.locator('body').innerText()).slice(0, 700);
  await page.screenshot({ path: 'shot-fl-created.png' });
  return { url: page.url(), body };
}
