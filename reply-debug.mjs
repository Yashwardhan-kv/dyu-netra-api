// Debug the reply: capture the actual bot bubble text + any console errors
export default async function run(page, ui) {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  await page.locator('.dyu-bot-fab').click();
  await page.waitForTimeout(1500);
  await page.fill('.dyu-bot-form input', 'What is MEVONU?');
  await page.click('.dyu-bot-form button[type=submit]');
  await page.waitForTimeout(15000);
  const msgs = await page.evaluate(() => [...document.querySelectorAll('.dyu-msg')].map(m => m.textContent.slice(0, 250)));
  return { msgs, errs };
}
