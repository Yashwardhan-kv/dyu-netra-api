export default async function run(page, ui) {
  await page.waitForTimeout(9000);
  await page.locator('#products').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: 'shot-products.png' });
  await page.goto('http://localhost:8787/services.html', { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  await page.locator('#mevonu').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'shot-services-mevonu.png' });
  const imgs = await page.evaluate(() => [...document.querySelectorAll('.prod-logo img')].map(i => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0 })));
  return imgs;
}
