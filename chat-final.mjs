export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  const fab = page.locator('.dyu-bot-fab');
  const count = await fab.count();
  let opened = false;
  if (count) {
    await fab.scrollIntoViewIfNeeded();
    await fab.click();
    await page.waitForTimeout(1800);
    opened = await page.locator('.dyu-bot-panel').isVisible().catch(() => false);
    await page.screenshot({ path: 'shot-chat-live.png' });
  }
  return { fabPresent: count > 0, panelOpened: opened };
}
