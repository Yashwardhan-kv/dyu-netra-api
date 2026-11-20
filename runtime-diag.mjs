export default async function run(page, ui) {
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  // Full runtime diagnosis
  const r = await page.evaluate(() => {
    const panel = document.querySelector('.dyu-bot-panel');
    if (!panel) return { error: 'panel missing' };
    const cs = getComputedStyle(panel);
    return {
      hiddenAttr: panel.hidden,
      cls: panel.className,
      display: cs.display,
      zIndex: cs.zIndex,
      position: cs.position,
      bottom: cs.bottom,
      fabZ: getComputedStyle(document.querySelector('.dyu-bot-fab')).zIndex
    };
  });
  // click & re-check
  await page.locator('.dyu-bot-fab').click({ force: true });
  await page.waitForTimeout(1200);
  r.after = await page.evaluate(() => {
    const panel = document.querySelector('.dyu-bot-panel');
    return { hiddenAttr: panel.hidden, cls: panel.className, display: getComputedStyle(panel).display };
  });
  await page.screenshot({ path: 'shot-runtime.png' });
  return r;
}
