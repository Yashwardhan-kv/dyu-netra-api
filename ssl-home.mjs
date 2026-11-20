export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://cpanel.freehosting.digitalplat.org/panel/indexpl.php?option=ssl_home', { waitUntil: 'load' }).catch(() => { });
  await page.waitForTimeout(6000);
  // Navigate directly with the __test cookie pre-set won't work; instead compute via evaluate of earlier known values
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 300) };
}
