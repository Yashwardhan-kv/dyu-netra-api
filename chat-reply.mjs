export default async function run(page, ui) {
  // The panel opened beautifully. Now send a message and capture the reply/error.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  const logs = [];
  page.on('console', m => { if (m.type() === 'error') logs.push(m.text().slice(0, 150)); });
  await page.locator('.dyu-bot-fab').click();
  await page.waitForTimeout(1200);
  await page.fill('.dyu-bot-form input', 'What is MEVONU?');
  await page.click('.dyu-bot-form button[type=submit]');
  await page.waitForTimeout(9000);
  const msgs = await page.evaluate(() => [...document.querySelectorAll('.dyu-msg')].map(m => m.textContent.slice(0, 150)));
  await page.screenshot({ path: 'shot-chat-reply.png' });
  return { msgs, consoleErrors: logs };
}
