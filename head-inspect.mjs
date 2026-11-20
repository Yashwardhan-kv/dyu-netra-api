export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8787/services.html', { waitUntil: 'load' });
  await page.waitForTimeout(7000);
  await page.locator('#mevonu').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const m = await page.evaluate(() => {
    const head = document.querySelector('#mevonu .head');
    const kids = [...head.children].map(c => ({ cls: c.className, w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height) }));
    const headBox = head.getBoundingClientRect();
    return { headW: Math.round(headBox.width), headH: Math.round(headBox.height), kids };
  });
  await page.screenshot({ path: 'shot-head-messy.png' });
  return m;
}
