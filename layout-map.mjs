export default async function run(page, ui) {
  // Get all visible element boxes to map the form layout
  const layout = await page.evaluate(() => {
    const els = [...document.querySelectorAll('a, button, input, [role=button], label')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width > 5 && r.height > 5 && (e.textContent.trim() || e.type);
    }).map(e => ({ tag: e.tagName, text: (e.textContent || e.value || '').trim().slice(0, 30), x: Math.round(e.getBoundingClientRect().x), y: Math.round(e.getBoundingClientRect().y), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) }));
    return els;
  });
  return layout.slice(0, 20);
}
