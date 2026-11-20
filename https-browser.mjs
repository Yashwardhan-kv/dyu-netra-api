export default async function run(page, ui) {
  const out = {};
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => out.err = e.message.slice(0, 200));
  await page.waitForTimeout(4000);
  out.title = await page.title();
  out.h1 = await page.evaluate(() => (document.querySelector('h1') || {}).textContent || '(none)');
  await page.screenshot({ path: 'shot-https.png' });
  return out;
}
