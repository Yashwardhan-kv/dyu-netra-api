export default async function run(page, ui) {
  const info = await page.evaluate(() => {
    const f = document.querySelector('form[name=genkey]');
    if (!f) return null;
    const fields = [...f.querySelectorAll('input,select,textarea')].map(el => ({ tag: el.tagName, name: el.name, type: el.type || '', options: el.tagName === 'SELECT' ? [...el.options].slice(0, 3).map(o => o.value) : undefined }));
    return { action: f.getAttribute('action'), fields };
  });
  return info;
}
