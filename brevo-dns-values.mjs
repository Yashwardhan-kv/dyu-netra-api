export default async function run(page, ui) {
  const vals = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('input, textarea').forEach(el => {
      const v = el.value || el.getAttribute('value') || '';
      if (v && v.trim()) out.push(v.trim());
    });
    // also grab copy-target spans/data attributes
    document.querySelectorAll('[data-copy-value], [data-clipboard-text]').forEach(el => {
      const v = el.getAttribute('data-copy-value') || el.getAttribute('data-clipboard-text');
      if (v) out.push('ATTR:' + v.trim());
    });
    return out;
  });
  return { url: page.url(), values: vals };
}
