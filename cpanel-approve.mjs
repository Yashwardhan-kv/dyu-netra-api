export default async function run(page, ui) {
  await page.getByText('I Approve', { exact: true }).first().click();
  await page.waitForTimeout(8000);
  return { url: page.url(), title: await page.title(), body: (await page.locator('body').innerText()).slice(0, 900) };
}
