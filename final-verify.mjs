// FINAL verification of both user-reported issues
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(13000);
  const st = {};

  // ISSUE 1: stays closed until clicked
  st.issue1_closedOnLoad = await page.evaluate(() => document.querySelector('.dyu-bot-panel').hidden === true);

  await page.evaluate(() => document.querySelector('.dyu-bot-fab').click());
  await page.waitForTimeout(1500);

  // ISSUE 2: panel visible above everything (fixed, correct z-index), even scrolled to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  st.issue2_visibleAtFooter = await page.evaluate(() => {
    const p = document.querySelector('.dyu-bot-panel');
    const r = p.getBoundingClientRect();
    return r.height > 300 && getComputedStyle(p).position === 'fixed' && !p.hidden;
  });

  // functional chat while scrolled
  await page.evaluate(() => {
    const i = document.querySelector('.dyu-bot-form input');
    i.value = 'What is DevAI?';
    document.querySelector('.dyu-bot-form button[type=submit]').click();
  });
  await page.waitForTimeout(15000);
  st.replyText = await page.evaluate(() => {
    const m = document.querySelectorAll('.dyu-msg');
    return m.length ? m[m.length - 1].textContent.slice(0, 220) : '(none)';
  });
  await page.screenshot({ path: 'shot-fixed-final.png' });
  return st;
}
