export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  const r = {};
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  r.closedByDefault = await page.locator('.dyu-bot-panel').isHidden();
  await page.locator('.dyu-bot-fab').click();
  await page.waitForTimeout(1500);
  r.opened = await page.locator('.dyu-bot-panel').isVisible();
  if (r.opened) {
    await page.fill('.dyu-bot-form input', 'What is DevAI? one sentence');
    await page.click('.dyu-bot-form button[type=submit]');
    await page.waitForTimeout(12000);
    r.msgs = await page.evaluate(() => [...document.querySelectorAll('.dyu-msg')].map(m => m.textContent.slice(0, 200)));
  }
  await page.screenshot({ path: 'shot-assistant-now.png' });
  return r;
}
