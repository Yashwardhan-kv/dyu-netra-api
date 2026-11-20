export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  const r = {};
  // 1. Blog index live
  await page.goto('http://dyunetra.dpdns.org/blog.html', { waitUntil: 'load' });
  await page.waitForTimeout(7000);
  r.index = await page.evaluate(() => [...document.querySelectorAll('.post')].map(p => ({
    t: (p.querySelector('h3') || {}).textContent,
    dyn: p.classList.contains('dyn'),
    link: (p.querySelector('a.rd') || {}).getAttribute ? p.querySelector('a.rd').getAttribute('href') : null
  })));
  await page.screenshot({ path: 'final-blog-index.png' });
  // 2. One seeded article page
  await page.goto('http://dyunetra.dpdns.org/post.html?slug=why-offline-first-forensics', { waitUntil: 'load' });
  await page.waitForTimeout(7000);
  r.article = await page.evaluate(() => ({
    title: (document.getElementById('post-title') || {}).textContent,
    meta: (document.getElementById('post-meta') || {}).textContent,
    paras: document.querySelectorAll('#post-body p').length
  }));
  await page.screenshot({ path: 'final-article.png' });
  return r;
}
