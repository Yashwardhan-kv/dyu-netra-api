export default async function run(page, ui) {
  await page.getByRole('button', { name: /verify records/i }).first().click();
  await page.waitForTimeout(9000);
  const body = (await page.locator('body').innerText()).slice(0, 2200);
  return { url: page.url(), body };
}
