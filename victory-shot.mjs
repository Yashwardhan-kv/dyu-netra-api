export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(8000); // boot screen + scene
  await page.screenshot({ path: 'shot-victory.png' });
  return { url: page.url(), title: await page.title(), lock: true };
}
