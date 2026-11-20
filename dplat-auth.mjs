export default async function run(page, ui) {
  // Step 1: choose E-Mail sign-in method
  const emailMethod = page.getByText('E-Mail', { exact: true }).first();
  await emailMethod.click();
  await page.waitForTimeout(2500);
  const body1 = (await page.locator('body').innerText()).slice(0, 300);
  // Step 2: fill email if a field appeared
  const emailInput = page.locator('input[type=email], input[name=email], input[autocomplete*=username]').first();
  let filledEmail = false;
  if (await emailInput.count() && await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill('yash.katkamwar.dev@gmail.com');
    filledEmail = true;
    await page.waitForTimeout(600);
    const next = page.getByRole('button', { name: /continue|next/i }).first();
    if (await next.count()) { await next.click(); await page.waitForTimeout(2500); }
  }
  // Step 3: password
  const pw = page.locator('input[type=password]').first();
  let filledPw = false;
  if (await pw.count() && await pw.isVisible().catch(() => false)) {
    await pw.fill('Davai@2026');
    filledPw = true;
    await page.waitForTimeout(1000);
    // turnstile may auto-solve; wait for token
    let token = false;
    for (let i = 0; i < 10; i++) {
      token = await page.evaluate(() => !!(document.querySelector('input[name="cf-turnstile-response"]') || {}).value);
      if (token) break;
      await page.waitForTimeout(2000);
    }
    const login = page.getByRole('button', { name: /^login$/i }).last();
    await login.click().catch(() => { });
    await page.waitForTimeout(9000);
  }
  return { url: page.url().slice(-60), body1, filledEmail, filledPw, body: (await page.locator('body').innerText()).slice(0, 300) };
}
