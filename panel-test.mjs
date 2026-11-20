// Verify: 1) panel CLOSED on load 2) click opens ABOVE content (fixed pos) 3) scroll test
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);

  const r = {};
  // 1. closed by default
  r.closedOnLoad = await page.locator('.dyu-bot-panel').isHidden();

  // 2. scroll to footer (this used to break the panel)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);

  // 3. click fab → open
  await page.locator('.dyu-bot-fab').click();
  await page.waitForTimeout(1500);
  r.openedAfterScroll = await page.locator('.dyu-bot-panel').isVisible();
  const pos = await page.locator('.dyu-bot-panel').evaluate(el => getComputedStyle(el).position);
  r.isFixed = pos === 'fixed';
  await page.screenshot({ path: 'shot-panel-fixed.png' });

  // 4. send message while scrolled down
  await page.fill('.dyu-bot-form input', 'What is MEVONU?');
  await page.click('.dyu-bot-form button[type=submit]');
  await page.waitForTimeout(12000);
  r.replyShown = await page.evaluate(() => {
    const msgs = document.querySelectorAll('.dyu-msg');
    return msgs.length >= 2 && msgs[msgs.length - 1].textContent.length > 20;
  });
  await page.screenshot({ path: 'shot-panel-reply.png' });
  return r;
}
