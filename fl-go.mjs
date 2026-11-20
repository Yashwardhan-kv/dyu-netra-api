export default async function run(page, ui) {
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => { });
  await page.waitForTimeout(8000);
  // email = 1st, password = 2nd; there is NO setup-code field rendered (only 2 inputs).
  await page.fill('input >> nth=0', 'admin@dyunetra.dpdns.org');
  await page.fill('input >> nth=1', 'FreeLLM#2026!');
  await page.screenshot({ path: 'shot-fl-8.png' });
  // click Create account
  await page.locator('button:has-text("Create account")').click();
  await page.waitForTimeout(8000);
  const body = (await page.locator('body').innerText()).slice(0, 500);
  await page.screenshot({ path: 'shot-fl-after.png' });
  return { url: page.url(), body };
}
