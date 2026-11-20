export default async function run(page, ui) {
  const btn = page.locator('button[type=submit]:has-text("Login")').first();
  await btn.click();
  await page.waitForTimeout(10000);
  return { url: page.url().slice(-50), body: (await page.locator('body').innerText()).slice(0, 350) };
}
