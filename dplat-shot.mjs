export default async function run(page, ui) {
  // Screenshot to see actual layout
  await page.screenshot({ path: 'shot-dplat-login.png' });
  // Try tab-order login: click E-Mail field, type, click Password, type, press Enter on form
  const emailBox = page.locator('input').nth(0);
  await emailBox.click({ clickCount: 3 });
  await emailBox.fill('yash.katkamwar.dev@gmail.com');
  const pwBox = page.locator('input[type=password]').first();
  await pwBox.click({ clickCount: 3 });
  await pwBox.fill('Davai@2026');
  await page.waitForTimeout(1500);
  // Is Login an <input type=submit>? Try both
  const submit = page.locator('input[type=submit][value*="ogin"], button:has-text("Login")').first();
  await submit.click();
  await page.waitForTimeout(10000);
  return { url: page.url().slice(-50), body: (await page.locator('body').innerText()).slice(0, 300) };
}
