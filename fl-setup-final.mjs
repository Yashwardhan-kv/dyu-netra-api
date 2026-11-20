export default async function run(page, ui) {
  // The setup form needs: email + password + setup code (revealed after first attempt)
  await page.goto('http://localhost:3001', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.fill('input[type=email]', 'admin@dyunetra.dpdns.org');
  await page.fill('input[type=password]', 'FreeLLM#2026!');
  // submit once to reveal setup-code field
  await page.locator('button:has-text("Create account")').click();
  await page.waitForTimeout(3000);
  // now fill setup code (from docker logs: Y4RH7F8RSY)
  const codeInput = page.locator('input:not([type=email]):not([type=password]):visible').first();
  if (await codeInput.count()) {
    await codeInput.fill('Y4RH7F8RSY');
    await page.locator('button:has-text("Create account")').click();
    await page.waitForTimeout(7000);
  }
  const body = (await page.locator('body').innerText()).slice(0, 500);
  await page.screenshot({ path: 'shot-fl-done.png' });
  return { url: page.url(), body };
}
