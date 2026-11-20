export default async function run(page, ui) {
  await page.goto('https://cpanel.freehosting.digitalplat.org/panel/index.php?mid=1081', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => { });
  await page.waitForTimeout(5000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 1200) };
}
