export default async function run(page, ui) {
  // The form may need stepping: E-Mail -> Continue -> Password
  await page.fill('input[type=email]', 'yash.katkamwar.dev@gmail.com');
  await page.getByRole('button', { name: /continue/i }).first().click().catch(() => { });
  await page.waitForTimeout(2500);
  // now password field should be visible
  const pw = page.locator('input[type=password]').first();
  if (await pw.count()) {
    await pw.fill('Davai@2026');
    await page.getByRole('button', { name: /^login$/i }).first().click().catch(() => page.keyboard.press('Enter'));
  }
  await page.waitForTimeout(9000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 350) };
}
