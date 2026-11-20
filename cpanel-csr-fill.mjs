export default async function run(page, ui) {
  // country select: find and pick India
  const sel = page.locator('select').first();
  await sel.selectOption({ label: 'India' }).catch(async () => { await sel.selectOption('IN'); });
  await page.locator('input[name="state"]').fill('Maharashtra');
  await page.locator('input[name="town"]').fill('Pune');
  await page.locator('input[name="company"]').fill('Dyunetra');
  await page.locator('input[name="dept"]').fill('Security Division');
  await page.locator('input[name="email"]').fill('founder@dyunetra.dpdns.org');
  await page.locator('input[name="B1"]').click();
  await page.waitForTimeout(8000);
  const text = await page.locator('body').innerText();
  // capture generated key/CSR if shown
  const vals = await page.evaluate(() => [...document.querySelectorAll('textarea')].map(t => ({ name: t.name || t.id, val: t.value.slice(0, 80) + '...' })));
  return { url: page.url().slice(-60), text: text.slice(0, 900), vals };
}
