// Verify issue2 precisely: is the OPEN panel visible while scrolled to footer?
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(13000);

  await page.evaluate(() => document.querySelector('.dyu-bot-fab').click());
  await page.waitForTimeout(1500);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  const vis = await page.evaluate(() => {
    const p = document.querySelector('.dyu-bot-panel');
    const r = p.getBoundingClientRect();
    const cs = getComputedStyle(p);
    return {
      display: cs.display, position: cs.position, zIndex: cs.zIndex,
      rect: { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) },
      inViewport: r.bottom <= innerHeight && r.top >= 0 && r.height > 300,
      hiddenAttr: p.hidden
    };
  });
  await page.screenshot({ path: 'shot-issue2.png' });
  return vis;
}
