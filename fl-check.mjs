export default async function run(page, ui) {
  await page.goto('http://localhost:3001', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'shot-fl-check.png' });
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 400) };
}
