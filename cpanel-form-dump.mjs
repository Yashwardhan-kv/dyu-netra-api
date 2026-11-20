export default async function run(page, ui) {
  // The form has its own inputs (country select etc). Re-fill carefully and submit.
  await page.waitForTimeout(2000);
  const formHtml = await page.evaluate(() => {
    const f = document.querySelector('form');
    return f ? f.outerHTML.slice(0, 2500) : '(no form)';
  });
  return { formHtml };
}
