export default async function run(page, ui) {
  await page.getByText('Generate SMTP key', { exact: false }).first().click();
  await page.waitForTimeout(4000);
  const body = (await page.locator('body').innerText()).slice(0, 1500);
  return { url: page.url(), body };
}
