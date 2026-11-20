export default async function run(page, ui) {
  await page.waitForTimeout(9000);
  await page.locator('#founder-teaser').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  const m = await page.evaluate(() => {
    const img = document.querySelector('.founder-frame img');
    return img ? { natural: img.naturalWidth + 'x' + img.naturalHeight, shown: img.clientWidth + 'x' + img.clientHeight } : null;
  });
  await page.screenshot({ path: 'shot-founder-fixed.png' });
  return m;
}
