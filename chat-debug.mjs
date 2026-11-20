export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  const diag = {};
  diag.fabExists = await page.locator('.dyu-bot-fab').count();
  diag.fabVisible = diag.fabExists ? await page.locator('.dyu-bot-fab').isVisible() : false;
  if (diag.fabExists) {
    const box = await page.locator('.dyu-bot-fab').boundingBox();
    diag.box = box;
    // click via mouse at center (bypasses any overlay issues)
    if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(2000);
    diag.panelHidden = await page.locator('.dyu-bot-panel').evaluate(el => el.hidden);
    diag.panelVisible = await page.locator('.dyu-bot-panel').isVisible().catch(() => false);
    // listen for console errors on next click
  }
  await page.screenshot({ path: 'shot-chat-debug.png' });
  return diag;
}
