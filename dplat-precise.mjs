export default async function run(page, ui) {
  // Step 1: click "E-Mail" method chooser (exact text node in the body)
  const em = page.locator('text="E-Mail"').first();
  await em.click();
  await page.waitForTimeout(3000);
  const after1 = (await page.locator('body').innerText()).slice(0, 400);
  // Step 2: find email input
  const email = page.locator('input[type=email], input[name=email], input[placeholder*="mail" i]').first();
  const emailCount = await email.count();
  let step2 = 'no email input';
  if (emailCount) {
    await email.fill('yash.katkamwar.dev@gmail.com');
    step2 = 'filled';
    const cont = page.getByRole('button', { name: /continue|next/i }).first();
    if (await cont.count() && await cont.isVisible().catch(() => false)) { await cont.click(); await page.waitForTimeout(3000); }
  }
  // Step 3: password
  const pw = page.locator('input[type=password]').first();
  const pwCount = await pw.count();
  let step3 = 'no pw input';
  if (pwCount) {
    await pw.fill('Davai@2026');
    step3 = 'filled';
    for (let i = 0; i < 8; i++) {
      const token = await page.evaluate(() => !!(document.querySelector('input[name="cf-turnstile-response"]') || {}).value);
      if (token) break;
      await page.waitForTimeout(2000);
    }
    const login = page.getByRole('button', { name: /^login$/i }).last();
    await login.click().catch(() => { });
    await page.waitForTimeout(9000);
  }
  const after = (await page.locator('body').innerText()).slice(0, 300);
  return { url: page.url().slice(-60), after1, step2, step3, after };
}
