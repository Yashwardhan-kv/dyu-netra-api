export default async function run(page, ui) {
  await page.fill('#login-email', 'yash.katkamwar.dev@gmail.com').catch(() => page.fill('input[type=email]', 'yash.katkamwar.dev@gmail.com'));
  await page.fill('#login-password', 'Davai@2026').catch(() => page.fill('input[type=password]', 'Davai@2026'));
  await page.waitForTimeout(800);
  const btn = page.getByRole('button', { name: /login/i });
  const disabled = await btn.first().isDisabled().catch(() => true);
  if (!disabled) { await btn.first().click(); }
  else { await page.keyboard.press('Enter'); }
  await page.waitForTimeout(9000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 400) };
}
