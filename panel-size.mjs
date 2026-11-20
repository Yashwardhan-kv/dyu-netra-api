export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  await page.locator('.dyu-bot-fab').click();
  await page.waitForTimeout(1800);
  const dims = await page.evaluate(() => {
    const p = document.querySelector('.dyu-bot-panel');
    const b = p.getBoundingClientRect();
    return Math.round(b.width) + ' × ' + Math.round(b.height);
  });
  await page.screenshot({ path: 'shot-panel-wide.png' });
  return dims;
}
