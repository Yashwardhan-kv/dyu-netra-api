export default async function run(page, ui) {
  const info = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input, select, textarea')].map(el => ({ tag: el.tagName, name: el.name || null, id: el.id || null, type: el.type || null, cls: el.className || null, html: el.outerHTML.slice(0, 120) }));
    return { count: inputs.length, inputs: inputs.slice(0, 20) };
  });
  return info;
}
