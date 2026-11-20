export default async function run(page, ui) {
  await page.waitForTimeout(9000); // let boot screen finish
  await page.screenshot({ path: 'shot-hero.png' });
  // scroll to products
  await page.locator('#products').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600);
  const card = page.locator('.prod').first();
  await card.hover();
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'shot-card-hover.png' });
  // stats section
  await page.locator('.stats').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: 'shot-stats.png' });
  return 'ok';
}
