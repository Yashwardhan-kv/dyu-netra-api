export default async function run(page, ui) {
  // Investigate the E-Mail element structure
  const info = await page.evaluate(() => {
    const els = [...document.querySelectorAll('a, button, div, span, li')].filter(e => e.textContent.trim() === 'E-Mail' && e.children.length <= 1);
    return els.map(e => ({ tag: e.tagName, cls: e.className, onclick: !!e.onclick, parent: e.parentElement.tagName + '.' + e.parentElement.className, html: e.outerHTML.slice(0, 150) }));
  });
  return info;
}
