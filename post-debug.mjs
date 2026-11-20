export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8787/post.html?slug=pipeline-test-001', { waitUntil: 'load' });
  await page.waitForTimeout(5000);
  const r1 = await page.evaluate(() => ({
    title: document.getElementById('post-title').textContent,
    loc: location.search,
    bodyLen: (document.getElementById('post-body').textContent || '').length
  }));
  await page.screenshot({ path: 'shot-post-real.png' });
  return r1;
}
