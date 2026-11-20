// Capture step 3 (after sending message) and dump what happened
export default async function run(page, ui) {
  // page is already at step2 state? Session closed after timeout. Redo quickly with shorter waits:
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(10000);

  const st = {};
  st.closed = await page.evaluate(() => getComputedStyle(document.querySelector('.dyu-bot-panel')).display === 'none');

  await page.evaluate(() => document.querySelector('.dyu-bot-fab').click());
  await page.waitForTimeout(1200);
  st.openDisplay = await page.evaluate(() => getComputedStyle(document.querySelector('.dyu-bot-panel')).display);
  st.hasOpen = await page.evaluate(() => document.querySelector('.dyu-bot-panel').classList.contains('open'));

  await page.evaluate(() => {
    const inp = document.querySelector('.dyu-bot-form input');
    inp.value = 'What is MEVONU?';
    document.querySelector('.dyu-bot-form button[type=submit]').click();
  });
  await page.waitForTimeout(18000);
  st.msgs = await page.evaluate(() => [...document.querySelectorAll('.dyu-msg')].map(m => m.textContent.slice(0, 300)));
  await page.screenshot({ path: 'shot-reply.png' });
  return st;
}
