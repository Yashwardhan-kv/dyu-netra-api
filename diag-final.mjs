export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(12000);

  const st = {};
  // mark the window so we can detect a reload
  await page.evaluate(() => { window.__marker = 'ALIVE'; });

  // 1. open panel
  await page.evaluate(() => document.querySelector('.dyu-bot-fab').click());
  await page.waitForTimeout(1200);
  st.openDisplay = await page.evaluate(() => getComputedStyle(document.querySelector('.dyu-bot-panel')).display);

  // 2. submit and detect navigation
  await page.evaluate(() => {
    const inp = document.querySelector('.dyu-bot-form input');
    inp.value = 'What is MEVONU?';
    document.querySelector('.dyu-bot-form button[type=submit]').click();
  });
  await page.waitForTimeout(8000);
  st.stillAlive = await page.evaluate(() => window.__marker === 'ALIVE');
  st.displayNow = await page.evaluate(() => getComputedStyle(document.querySelector('.dyu-bot-panel')).display);
  st.url = page.url().slice(0, 60);
  st.msgs = await page.evaluate(() => [...document.querySelectorAll('.dyu-msg')].map(m => m.textContent.slice(0, 220)));
  await page.screenshot({ path: 'shot-diag.png' });
  return st;
}
