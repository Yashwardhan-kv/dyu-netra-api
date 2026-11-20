export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8787/', { waitUntil: 'load' });
  await page.waitForTimeout(7500);
  // Scroll deep and check nav visibility
  await page.evaluate(() => window.scrollTo(0, 2200));
  await page.waitForTimeout(1200);
  const nav = await page.evaluate(() => {
    const n = document.querySelector('.nav');
    const r = n.getBoundingClientRect();
    return { top: Math.round(r.top), visible: r.top >= -5 && r.bottom > 0, stuck: n.classList.contains('stuck') };
  });
  await page.screenshot({ path: 'shot-nav-stuck.png' });
  // founder section
  await page.locator('#founder-teaser').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: 'shot-founder-noborder.png' });
  return nav;
}
