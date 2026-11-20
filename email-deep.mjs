export default async function run(page, ui) {
  // "E-Mail" might be an icon-box; look for clickable containers near the text
  const info = await page.evaluate(() => {
    const out = [];
    const walk = (el, depth) => {
      if (depth > 6 || out.length > 8) return;
      for (const c of el.children) {
        const t = (c.textContent || '').trim();
        if (t === 'E-Mail' || t.startsWith('E-Mail')) {
          out.push({ tag: c.tagName, cls: String(c.className).slice(0, 80), clickable: !!(c.onclick || c.getAttribute('role') || c.tagName === 'A' || c.tagName === 'BUTTON'), html: c.outerHTML.slice(0, 250) });
        }
        walk(c, depth + 1);
      }
    };
    walk(document.body, 0);
    return out;
  });
  return info;
}
