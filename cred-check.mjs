export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8787/credibility.html', { waitUntil: 'load' });
  await page.waitForTimeout(7000);
  const r = await page.evaluate(() => ({
    creds: document.querySelectorAll('.cred').length,
    certImgLoaded: (() => { const i = document.querySelector('.cred-badge img'); return i ? i.complete && i.naturalWidth > 0 : false; })(),
    footerHasCred: [...document.querySelectorAll('footer a')].some(a => /Credibility/.test(a.textContent))
  }));
  await page.screenshot({ path: 'shot-credibility.png' });
  return r;
}
