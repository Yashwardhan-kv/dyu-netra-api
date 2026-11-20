// Step-by-step verification of open/close cycle with a fixed 60s headroom
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(12000);

  const st = {};
  st.step1_closedOnLoad = await page.evaluate(() => {
    const p = document.querySelector('.dyu-bot-panel');
    return p ? getComputedStyle(p).display === 'none' : 'panel missing';
  });

  // click fab
  await page.evaluate(() => document.querySelector('.dyu-bot-fab').click());
  await page.waitForTimeout(1500);
  st.step2_displayAfterClick = await page.evaluate(() => getComputedStyle(document.querySelector('.dyu-bot-panel')).display);
  st.step2_hasOpenClass = await page.evaluate(() => document.querySelector('.dyu-bot-panel').classList.contains('open'));

  await page.screenshot({ path: 'shot-step2.png' });

  // type + send via DOM events directly
  await page.evaluate(() => {
    const inp = document.querySelector('.dyu-bot-form input');
    inp.value = 'What is MEVONU?';
    document.querySelector('.dyu-bot-form button[type=submit]').click();
  });
  await page.waitForTimeout(15000);
  st.step3_msgs = await page.evaluate(() => [...document.querySelectorAll('.dyu-msg')].map(m => m.textContent.slice(0, 250)));
  await page.screenshot({ path: 'shot-step3.png' });
  return st;
}
