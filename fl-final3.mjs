export default async function run(page, ui) {
  await page.goto('http://localhost:3001', { waitUntil: 'load', timeout: 40000 });
  await page.waitForTimeout(5000);
  await page.fill('input[type=email]', 'admin@dyunetra.dpdns.org');
  await page.fill('input[type=password]', 'FreeLLM#2026!');
  await page.locator('button:has-text("Create account")').click();
  await page.waitForTimeout(9000);
  const body = (await page.locator('body').innerText()).slice(0, 700);
  await page.screenshot({ path: 'shot-fl-submit.png' });
  return { url: page.url(), body };
}
