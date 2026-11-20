export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  // The Supabase table has been seeded? Test with the seeded slug if it exists; else expect graceful fail.
  await page.goto('http://localhost:8787/post.html?slug=why-offline-first-forensics', { waitUntil: 'load' });
  await page.waitForTimeout(5500);
  const title = await page.evaluate(() => document.getElementById('post-title').textContent);
  const bodyLen = await page.evaluate(() => (document.getElementById('post-body').textContent || '').length);
  await page.screenshot({ path: 'shot-post-page.png' });
  // blog index links
  await page.goto('http://localhost:8787/blog.html', { waitUntil: 'load' });
  await page.waitForTimeout(5500);
  const links = await page.evaluate(() => [...document.querySelectorAll('.post a.rd')].map(a => a.getAttribute('href')));
  return { title, bodyLen, links: links.slice(0, 5) };
}
