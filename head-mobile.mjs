export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8787/services.html', { waitUntil: 'load' });
  await page.waitForTimeout(7000);
  await page.locator('#devai').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'shot-devai.png' });
  // mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1200);
  await page.locator('#mevonu').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'shot-mobile-head.png' });
  return 'ok';
}
