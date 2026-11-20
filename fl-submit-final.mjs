export default async function run(page, ui) {
  await page.setViewportSize({ width: 760, height: 500 });
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  // fields: email(0), password(1), setup code(2)
  await page.fill('input >> nth=0', 'admin@dyunetra.dpdns.org');
  await page.fill('input >> nth=1', 'FreeLLM#2026!');
  await page.fill('input >> nth=2', 'Y4RH7F8RSY');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'shot-filled.png' });
  const btn = page.locator('button:has-text("Create account")');
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await btn.click();
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'shot-submitted.png' });
  const body = (await page.locator('body').innerText()).slice(0, 600);
  return { url: page.url(), body };
}
