export default async function run(page, ui) {
  await page.screenshot({ path: 'shot-hosting-state.png' });
  return { url: page.url().slice(0, 90), body: (await page.locator('body').innerText()).slice(0, 600) };
}
