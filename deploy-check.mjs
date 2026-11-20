export default async function run(page, ui) {
  await page.goto('https://cpanel.freehosting.digitalplat.org/index.php', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 800) };
}
