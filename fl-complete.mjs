export default async function run(page, ui) {
  // Complete FreeLLMAPI first-run: create admin account
  await page.goto('http://localhost:3001', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(4000);
  const body1 = (await page.locator('body').innerText()).slice(0, 400);
  // fill email + password
  const email = page.locator('input[type=email], input[name=email]').first();
  await email.fill('admin@dyunetra.dpdns.org');
  const pw = page.locator('input[type=password]').first();
  await pw.fill('FreeLLM#2026!');
  await page.screenshot({ path: 'shot-fl-form.png' });
  // submit
  const btn = page.locator('button').last();
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(7000);
  const body2 = (await page.locator('body').innerText()).slice(0, 600);
  await page.screenshot({ path: 'shot-fl-after.png' });
  return { url: page.url(), body1, body2 };
}
