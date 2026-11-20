export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  // closed by default?
  const closedByDefault = await page.locator('.dyu-bot-panel').isHidden();
  // click to open
  await page.locator('.dyu-bot-fab').click();
  await page.waitForTimeout(1500);
  const opened = await page.locator('.dyu-bot-panel').isVisible();
  // ask a real question
  await page.fill('.dyu-bot-form input', 'What is QEVRAXIS?');
  await page.click('.dyu-bot-form button[type=submit]');
  await page.waitForTimeout(12000);
  const msgs = await page.evaluate(() => [...document.querySelectorAll('.dyu-msg')].map(m => m.textContent.slice(0, 180)));
  await page.screenshot({ path: 'shot-chatbot-final.png' });
  return { closedByDefault, opened, conversation: msgs };
}
