export default async function run(page, ui) {
  await page.goto('http://dyunetra.dpdns.org/blog.html', { waitUntil: 'load' });
  await page.waitForTimeout(6000);
  const inline = await page.evaluate(() => {
    const offenders = [];
    document.querySelectorAll('[style]').forEach(el => {
      if (el.tagName !== 'BODY' && el.tagName !== 'HTML') offenders.push(el.tagName + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
    });
    return offenders.slice(0, 8);
  });
  return { inlineStyleTags: inline };
}
