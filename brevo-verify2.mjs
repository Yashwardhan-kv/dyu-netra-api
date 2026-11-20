export default async function run(page, ui) {
  await page.getByRole('button', { name: /verify records/i }).first().click();
  await page.waitForTimeout(12000);
  const body = (await page.locator('body').innerText());
  const ok = body.includes('match');
  return { body: body.slice(0, 1800) };
}
