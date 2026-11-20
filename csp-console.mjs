export default async function run(page, ui) {
  const msgs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') msgs.push(m.type() + ': ' + m.text().slice(0, 160)); });
  await page.goto('http://dyunetra.dpdns.org/blog.html', { waitUntil: 'load' });
  await page.waitForTimeout(6000);
  const counts = await page.evaluate(() => ({ dyn: document.querySelectorAll('.post.dyn').length, total: document.querySelectorAll('.post').length }));
  return { counts, msgs: msgs.slice(0, 10) };
}
