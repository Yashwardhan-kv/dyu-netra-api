export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://dyunetra.dpdns.org/blog.html', { waitUntil: 'load' });
  await page.waitForTimeout(7000);
  const plus = await page.evaluate(() => {
    const rd = document.querySelector('a.rd');
    if (!rd) return 'no rd link';
    const st = getComputedStyle(rd, '::after');
    return st.content === 'none' || st.content === 'normal' ? 'PLUS REMOVED' : 'still: ' + st.content;
  });
  await page.screenshot({ path: 'plus-fixed.png' });
  return plus;
}
