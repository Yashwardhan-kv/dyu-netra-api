export default async function run(page, ui) {
  await page.setViewportSize({ width: 760, height: 900 });
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  await page.fill('input[type=email]', 'admin@dyunetra.dpdns.org');
  await page.fill('input[type=password]', 'FreeLLM#2026!');
  // setup code field — scroll down to it
  const fields = page.locator('input');
  const n = await fields.count();
  for (let i = 0; i < n; i++) {
    const el = fields.nth(i);
    const ph = (await el.getAttribute('placeholder').catch(() => '')) || '';
    if (/code/i.test(ph)) {
      await el.scrollIntoViewIfNeeded();
      await el.fill('Y4RH7F8RSY');
      break;
    }
  }
  await page.waitForTimeout(400);
  const btn = page.locator('button:has-text("Create account")');
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await btn.click();
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'shot-post2.png' });
  const body = (await page.locator('body').innerText()).slice(0, 600);
  return { url: page.url(), body };
}
