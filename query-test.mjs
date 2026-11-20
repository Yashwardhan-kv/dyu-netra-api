export default async function run(page, ui) {
  const out = {};
  await page.goto('http://localhost:8787/post.html?slug=test-query', { waitUntil: 'domcontentloaded' });
  out.local = await page.evaluate(() => location.search);
  await page.goto('http://dyunetra.dpdns.org/post.html?slug=test-query', { waitUntil: 'domcontentloaded' }).catch(() => { });
  await page.waitForTimeout(3000);
  out.live = await page.evaluate(() => ({ search: location.search, title: (document.getElementById('post-title') || {}).textContent }));
  return out;
}
