export default async function run(page, ui) {
  return { url: page.url().slice(-60), body: (await page.locator('body').innerText()).slice(0, 400) };
}
