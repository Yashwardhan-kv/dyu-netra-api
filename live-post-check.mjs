export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  const r = {};
  // post page on live (uses your pipeline-test post)
  await page.goto('http://dyunetra.dpdns.org/post.html?slug=pipeline-test-001', { waitUntil: 'load' });
  await page.waitForTimeout(7000);
  r.title = await page.evaluate(() => (document.getElementById('post-title') || {}).textContent);
  r.bodyLen = await page.evaluate(() => ((document.getElementById('post-body') || {}).textContent || '').length);
  r.h1 = await page.evaluate(() => (document.querySelector('h1') || {}).textContent);
  await page.screenshot({ path: 'shot-live-post.png' });
  return r;
}
