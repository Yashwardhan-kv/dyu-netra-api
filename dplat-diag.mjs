export default async function run(page, ui) {
  const diag = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input')].map(el => ({ type: el.type, name: el.name, id: el.id, visible: !!(el.offsetWidth || el.offsetHeight), value: el.value }));
    const btns = [...document.querySelectorAll('button')].map(el => ({ text: el.innerText.trim(), disabled: el.disabled, cls: el.className.slice(0, 60) }));
    return { inputs, btns, forms: document.querySelectorAll('form').length, html: document.body.innerHTML.slice(0, 3000) };
  });
  return diag;
}
