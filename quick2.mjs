// Faster: skip boot wait by checking CSS classes directly (no visual dependence)
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'commit', timeout: 60000 });
  // wait for fab only
  await page.waitForSelector('.dyu-bot-fab', { timeout: 40000 });
  await page.waitForTimeout(3000);

  // click via DOM
  await page.evaluate(() => document.querySelector('.dyu-bot-fab').click());
  await page.waitForTimeout(1000);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);

  return await page.evaluate(() => {
    const p = document.querySelector('.dyu-bot-panel');
    const cs = getComputedStyle(p);
    const r = p.getBoundingClientRect();
    return {
      cls: p.className, hiddenAttr: p.hidden, display: cs.display,
      pos: cs.position, z: cs.zIndex, rectY: Math.round(r.y), rectH: Math.round(r.height),
      onScreen: r.top >= 0 && r.bottom <= innerHeight
    };
  });
}
