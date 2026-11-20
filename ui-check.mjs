export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  await page.locator('.dyu-bot-fab').click();
  await page.waitForTimeout(1500);
  await page.fill('.dyu-bot-form input', 'What is MEVONU?');
  await page.click('.dyu-bot-form button[type=submit]');
  await page.waitForTimeout(12000);
  const size = await page.evaluate(() => {
    const p = document.querySelector('.dyu-bot-panel');
    const msg = document.querySelector('.dyu-bot-msg');
    return { panel: Math.round(p.getBoundingClientRect().width) + 'x' + Math.round(p.getBoundingClientRect().height), msgFont: getComputedStyle(msg).fontSize };
  });
  await page.screenshot({ path: 'shot-chat-big.png' });
  return size;
}
