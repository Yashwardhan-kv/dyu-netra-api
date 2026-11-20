export default async function run(page, ui) {
  const pw = page.locator('input[type=password]').first();
  await pw.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  // The Login button is right after the password field
  const loginBtn = page.getByRole('button', { name: /^Login$/i }).last();
  await loginBtn.scrollIntoViewIfNeeded();
  await loginBtn.click();
  await page.waitForTimeout(10000);
  return { url: page.url().slice(-60), body: (await page.locator('body').innerText()).slice(0, 400) };
}
