export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  await page.locator('.dyu-bot-fab').click();
  await page.waitForTimeout(1800);
  const dims = await page.evaluate(() => {
    const panel = document.querySelector('.dyu-bot-panel');
    const kids = [...panel.children].map(el => ({ top: Math.round(el.getBoundingClientRect().top), h: Math.round(el.getBoundingClientRect().height) }));
    const pr = panel.getBoundingClientRect();
    return { panel: Math.round(pr.width) + '×' + Math.round(pr.height), headerTop: kids[0].top, headerH: kids[0].h };
  });
  await page.screenshot({ path: 'shot-gap-fixed.png' });
  return dims;
}
