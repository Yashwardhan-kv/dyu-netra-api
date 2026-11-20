export default async function run(page, ui) {
  // Inspect actual input field names
  const fields = await page.evaluate(() => [...document.querySelectorAll('input, button')].map(el => ({
    tag: el.tagName, type: el.type || '', name: el.name || '', id: el.id || '', ph: el.placeholder || '', text: (el.innerText || el.value || '').slice(0, 30)
  })));
  return fields.filter(f => f.tag !== 'HIDDEN').slice(0, 15);
}
