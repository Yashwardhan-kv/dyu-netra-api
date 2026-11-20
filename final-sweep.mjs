export default async function run(page, ui) {
  const out = [];
  await page.setViewportSize({ width: 1440, height: 900 });
  const pages = ['index.html', 'about.html', 'services.html', 'blog.html', 'contact.html', 'whitepaper.html', 'terms.html', 'privacy.html'];
  for (const pg of pages) {
    await page.goto('http://localhost:8787/' + pg, { waitUntil: 'load' });
    await page.waitForTimeout(6500);
    const audit = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if ((r.right > window.innerWidth + 8 || r.left < -8) && r.width > 30) {
          const cls = (typeof el.className === 'string' && el.className) ? '.' + el.className.split(' ')[0] : '';
          if (!['CANVAS', 'SCRIPT', 'STYLE', 'LINK', 'HTML'].includes(el.tagName)) bad.push(el.tagName + cls);
        }
      });
      const errs = window.__errs || 0;
      return { overflow: [...new Set(bad)].slice(0, 5), errs };
    });
    // full-page screenshot
    await page.screenshot({ path: 'sweep-' + pg.replace('.html', '') + '.png', fullPage: false });
    // footer check
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const footLinks = await page.evaluate(() => [...document.querySelectorAll('footer .foot a')].map(a => a.textContent.trim()));
    await page.screenshot({ path: 'sweep-foot-' + pg.replace('.html', '') + '.png' });
    out.push({ pg, overflow: audit.overflow, footerHasNew: footLinks.filter(l => /Whitepaper|Terms|Privacy/.test(l)) });
  }
  return out;
}
