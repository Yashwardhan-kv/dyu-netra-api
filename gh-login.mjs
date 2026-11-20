export default async function run(page, ui) {
  await page.getByText('Sign in with GitHub', { exact: false }).first().click();
  await page.waitForTimeout(6000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 500) };
}
