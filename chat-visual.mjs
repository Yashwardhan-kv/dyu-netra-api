export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  const fab = page.locator('.dyu-bot-fab');
  const count = await fab.count();
  if (count) {
    await fab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'shot-chatbot.png' });
  }
  return { fabPresent: count > 0 };
}
