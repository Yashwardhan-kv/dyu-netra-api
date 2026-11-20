export default async function run(page, ui) {
  return await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input')].map(el => ({ type: el.type, value: el.value, readOnly: el.readOnly })).filter(x => x.value);
    const copys = [...document.querySelectorAll('*')].filter(e => e.textContent.trim() === 'Copy').length;
    return { inputs, copys };
  });
}
