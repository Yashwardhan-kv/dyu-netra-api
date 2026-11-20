export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(10000);

  const st = {};
  st.closedOnLoad = await page.evaluate(() => !document.querySelector('.dyu-bot-panel').classList.contains('open'));

  await page.locator('.dyu-bot-fab').click();
  await page.waitForTimeout(1500);
  st.openClassAfterClick = await page.evaluate(() => document.querySelector('.dyu-bot-panel').classList.contains('open'));
  st.fixed = await page.locator('.dyu-bot-panel').evaluate(el => getComputedStyle(el).position);
  await page.screenshot({ path: 'shot-open.png' });

  // send message
  await page.fill('.dyu-bot-form input', 'What is MEVONU?');
  await page.click('.dyu-bot-form button[type=submit]');
  await page.waitForTimeout(15000);
  st.msgs = await page.evaluate(() => [...document.querySelectorAll('.dyu-msg')].map(m => m.textContent.slice(0, 200)));
  await page.screenshot({ path: 'shot-reply.png' });
  return st;
}
