export default async function run(page, ui) {
  await page.screenshot({ path: 'shot-gh-result.png' });
  return { url: page.url().slice(0, 110), body: (await page.locator('body').innerText()).slice(0, 500) };
}
