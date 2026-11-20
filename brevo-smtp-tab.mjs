export default async function run(page, ui) {
  // Click the "SMTP" sub-tab
  await page.getByText('SMTP', { exact: true }).first().click();
  await page.waitForTimeout(5000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 2000) };
}
