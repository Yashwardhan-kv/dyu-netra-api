export default async function run(page, ui) {
  await page.setViewportSize({ width: 1280, height: 950 });
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(7000);
  // fill email + password via nth
  await page.fill('input >> nth=0', 'admin@dyunetra.dpdns.org');
  await page.fill('input >> nth=1', 'FreeLLM#2026!');
  await page.fill('input >> nth=2', 'Y4RH7F8RSY');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shot-fla.png' });
  await page.click('button:has-text("Create account")');
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'shot-flb.png' });
  const body = (await page.locator('body').innerText()).slice(0, 600);
  return { url: page.url(), body };
}
