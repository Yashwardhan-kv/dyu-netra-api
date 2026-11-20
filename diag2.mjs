export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(12000);
  const st = {};
  await page.evaluate(() => { window.__marker = 'ALIVE'; });
  await page.evaluate(() => document.querySelector('.dyu-bot-fab').click());
  await page.waitForTimeout(1200);
  st.openDisplay = await page.evaluate(() => getComputedStyle(document.querySelector('.dyu-bot-panel')).display);
  await page.evaluate(() => {
    document.querySelector('.dyu-bot-form input').value = 'What is MEVONU?';
    document.querySelector('.dyu-bot-form button[type=submit]').click();
  });
  await page.waitForTimeout(8000);
  st.reloadHappened = await page.evaluate(() => window.__marker !== 'ALIVE');
  st.openDisplayAfter = await page.evaluate(() => getComputedStyle(document.querySelector('.dyu-bot-panel')).display);
  st.msgs = await page.evaluate(() => [...document.querySelectorAll('.dyu-msg')].map(m => m.textContent.slice(0, 220)));
  await page.screenshot({ path: 'shot-diag.png' });
  return st;
}
