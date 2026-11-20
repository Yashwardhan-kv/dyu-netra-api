export default async function run(page, ui) {
  // Email + password already filled. Fill Setup code and submit.
  const code = page.locator('input').nth(2); // 3rd field = setup code
  await code.scrollIntoViewIfNeeded();
  await code.fill('Y4RH7F8RSY');
  await page.waitForTimeout(500);
  // submit button is below — scroll & click
  const btn = page.locator('button:has-text("Create"), button:has-text("Setup"), button[type=submit]').last();
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(8000);
  const body = (await page.locator('body').innerText()).slice(0, 600);
  await page.screenshot({ path: 'shot-fl-final.png' });
  return { url: page.url(), body };
}
