export default async function run(page, ui) {
  // open htdocs folder
  const link = page.getByText('htdocs', { exact: true }).first();
  await link.click();
  await page.waitForTimeout(5000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 800) };
}
