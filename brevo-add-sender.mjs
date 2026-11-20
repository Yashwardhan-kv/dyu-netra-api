export default async function run(page, ui) {
  await page.locator('text=Add sender').first().click();
  await page.waitForTimeout(4000);
  // Fill sender form
  const body = await page.locator('body').innerText();
  return { url: page.url(), body: body.slice(0, 1500) };
}
