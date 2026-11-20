export default async function run(page, ui) {
  await page.selectOption('select[name=country]', 'IN');
  await page.fill('input[name=state]', 'Maharashtra');
  await page.fill('input[name=town]', 'Pune');
  await page.fill('input[name=company]', 'Dyunetra');
  await page.fill('input[name=dept]', 'Security Division');
  await page.fill('input[name=email]', 'founder@dyunetra.dpdns.org');
  await page.click('input#submit_domain');
  await page.waitForTimeout(9000);
  const text = await page.locator('body').innerText();
  const textareas = await page.evaluate(() => [...document.querySelectorAll('textarea')].map(t => ({ name: t.name || t.id, len: t.value.length, head: t.value.slice(0, 50) })));
  return { url: page.url().slice(-70), text: text.slice(0, 700), textareas };
}
