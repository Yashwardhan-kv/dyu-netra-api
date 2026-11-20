// Write result to a file so we can read it reliably
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'commit', timeout: 60000 });
  await page.waitForSelector('.dyu-bot-fab', { timeout: 40000 });
  await page.waitForTimeout(3000);

  await page.evaluate(() => document.querySelector('.dyu-bot-fab').click());
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);

  const res = await page.evaluate(() => {
    const p = document.querySelector('.dyu-bot-panel');
    const cs = getComputedStyle(p);
    const r = p.getBoundingClientRect();
    return JSON.stringify({
      cls: p.className, hiddenAttr: p.hidden, display: cs.display,
      pos: cs.position, z: cs.zIndex, top: Math.round(r.y), h: Math.round(r.height)
    });
  });
  await page.screenshot({ path: 'shot-q3.png' });
  return res;
}
