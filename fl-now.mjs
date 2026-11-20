export default async function run(page, ui) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  const body = (await page.locator('body').innerText()).slice(0, 400);
  const n = await page.locator('input:visible').count();
  await page.screenshot({ path: 'shot-fl-now.png' });
  return { inputs: n, body };
}
