export default async function run(page, ui) {
  await page.getByText('SSL/TLS', { exact: true }).first().click();
  await page.waitForTimeout(6000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 1200) };
}
