export default async function run(page, ui) {
  const shots = [];
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const pg of ['index.html', 'about.html', 'services.html', 'blog.html', 'contact.html']) {
    await page.goto('http://localhost:8787/' + pg, { waitUntil: 'load' });
    await page.waitForTimeout(6500);
    // overflow check
    const overflow = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > window.innerWidth + 8 || r.left < -8) {
          const cls = (el.className && typeof el.className === 'string') ? '.' + el.className.split(' ')[0] : '';
          if (!['CANVAS', 'SCRIPT', 'STYLE', 'LINK'].includes(el.tagName) && r.width > 30) bad.push(el.tagName + cls + ':' + Math.round(r.right));
        }
      });
      return bad.slice(0, 6);
    });
    await page.screenshot({ path: 'shot-align-' + pg.replace('.html', '') + '.png' });
    shots.push({ pg, overflow });
  }
  return shots;
}
