export default async function run(page, ui) {
  await page.getByRole('button', { name: /authenticate domain/i }).first().click();
  await page.waitForTimeout(10000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 1200) };
}
