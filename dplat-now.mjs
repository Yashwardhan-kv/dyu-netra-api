export default async function run(page, ui) {
  await page.screenshot({ path: 'shot-dplat-now.png' });
  return { url: page.url().slice(-60), body: (await page.locator('body').innerText()).slice(0, 500) };
}
