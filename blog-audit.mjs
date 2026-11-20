export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://dyunetra.dpdns.org/blog.html', { waitUntil: 'load' });
  await page.waitForTimeout(7000);
  const info = await page.evaluate(() => {
    const all = [...document.querySelectorAll('.post')];
    return all.map(p => ({
      title: (p.querySelector('h3') || {}).textContent,
      dynamic: p.classList.contains('dyn'),
      hasLink: !!p.querySelector('a.rd')
    }));
  });
  await page.screenshot({ path: 'shot-blog-now.png' });
  return info;
}
