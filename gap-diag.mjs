export default async function run(page, ui) {
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  await page.locator('.dyu-bot-fab').click();
  await page.waitForTimeout(1500);
  const diag = await page.evaluate(() => {
    const panel = document.querySelector('.dyu-bot-panel');
    const kids = [...panel.children].map(el => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { tag: el.tagName, cls: el.className.slice(0, 30), top: Math.round(r.top), h: Math.round(r.height), mt: cs.marginTop, pt: cs.paddingTop };
    });
    const pr = panel.getBoundingClientRect();
    return { panelTop: Math.round(pr.top), panelH: Math.round(pr.height), kids };
  });
  return diag;
}
