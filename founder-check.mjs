export default async function run(page, ui) {
  await page.waitForTimeout(9000);
  // Home founder section
  await page.locator('#founder-teaser').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  const m = await page.evaluate(() => {
    const img = document.querySelector('.founder-frame img');
    const txt = document.querySelector('#founder-teaser .wrap > div:first-child');
    return {
      img: img ? { w: img.clientWidth, h: img.clientHeight } : null,
      text: txt ? { w: txt.clientWidth, h: txt.clientHeight } : null
    };
  });
  await page.screenshot({ path: 'shot-founder.png' });
  // About page too
  await page.goto('http://localhost:8787/about.html', { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  await page.locator('.founder-frame').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: 'shot-about-founder.png' });
  return m;
}
