export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  await page.locator('.dyu-bot-fab').click();
  await page.waitForTimeout(1500);
  const diag = await page.evaluate(() => {
    const panel = document.querySelector('.dyu-bot-panel');
    const kids = [...panel.children].map(el => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName, cls: String(el.className).slice(0, 25), top: Math.round(r.top), h: Math.round(r.height) };
    });
    const pr = panel.getBoundingClientRect();
    return { panelTop: Math.round(pr.top), kids };
  });
  await page.screenshot({ path: 'shot-gap.png' });
  return diag;
}
