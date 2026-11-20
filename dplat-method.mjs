export default async function run(page, ui) {
  // Click the "E-Mail" method chooser
  await page.getByText('E-Mail', { exact: true }).first().click();
  await page.waitForTimeout(2000);
  // Now an email input should appear
  const email = page.locator('input[type=email], input[name=email], input[placeholder*="mail" i]').first();
  await email.waitFor({ state: 'visible', timeout: 8000 });
  await email.fill('yash.katkamwar.dev@gmail.com');
  await page.waitForTimeout(800);
  // continue or direct password
  const cont = page.getByRole('button', { name: /continue|next/i }).first();
  if (await cont.count() && await cont.isVisible().catch(() => false)) { await cont.click(); await page.waitForTimeout(2000); }
  const pw = page.locator('input[type=password]').first();
  await pw.waitFor({ state: 'visible', timeout: 8000 });
  await pw.fill('Davai@2026');
  await page.waitForTimeout(800);
  const login = page.getByRole('button', { name: /login/i }).last();
  await login.click();
  await page.waitForTimeout(10000);
  return { url: page.url().slice(-50), body: (await page.locator('body').innerText()).slice(0, 350) };
}
