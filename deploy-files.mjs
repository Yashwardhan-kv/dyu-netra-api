export default async function run(page, ui) {
  await page.getByText('Online File Manager', { exact: true }).first().click();
  await page.waitForTimeout(7000);
  // File manager may open in a new tab/window
  const pages = page.context().pages();
  const target = pages.length > 1 ? pages[pages.length - 1] : page;
  await target.waitForTimeout(3000);
  return { count: pages.length, url: target.url(), body: (await target.locator('body').innerText()).slice(0, 600) };
}
