export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8787/credibility.html', { waitUntil: 'load' });
  await page.waitForTimeout(7000);
  const r = await page.evaluate(() => ({
    entries: [...document.querySelectorAll('.cred .idx')].map(e => e.textContent),
    badgeLoaded: (() => { const i = document.querySelector('.cred-badge img'); return i ? i.complete && i.naturalWidth > 0 : 'none'; })(),
    badgeIn05: (() => { const arts = [...document.querySelectorAll('.cred')]; const a5 = arts[4]; return a5 ? !!a5.querySelector('.cred-badge img') : false; })(),
    badgeOnlyIn05: document.querySelectorAll('.cred-badge').length === 1
  }));
  await page.locator('.cred-badge').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'shot-cred-05.png' });
  return r;
}
