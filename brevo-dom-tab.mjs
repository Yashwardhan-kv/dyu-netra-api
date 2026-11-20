export default async function run(page, ui) {
  // Navigate to Domains tab within senders page
  await page.getByText('Domains', { exact: true }).first().click();
  await page.waitForTimeout(5000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 1200) };
}
