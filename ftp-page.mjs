export default async function run(page, ui) {
  await page.getByText('FTP Accounts', { exact: true }).first().click();
  await page.waitForTimeout(7000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 1800) };
}
