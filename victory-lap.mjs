// FINAL verification: UI open/close + real AI answer
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  const r = {};
  r.closedByDefault = await page.locator('.dyu-bot-panel').isHidden();
  await page.locator('.dyu-bot-fab').click();
  await page.waitForTimeout(1500);
  r.opened = await page.locator('.dyu-bot-panel').isVisible();
  await page.fill('.dyu-bot-form input', 'What is MEVONU? one sentence');
  await page.click('.dyu-bot-form button[type=submit]');
  await page.waitForTimeout(14000);
  r.replies = await page.evaluate(() => [...document.querySelectorAll('.dyu-msg')].map(m => m.textContent.slice(0, 250)));
  // close test
  await page.locator('.dyu-bot-x').click();
  await page.waitForTimeout(800);
  r.closedAgain = await page.locator('.dyu-bot-panel').isHidden();
  await page.screenshot({ path: 'shot-assistant-final.png' });
  return r;
}
