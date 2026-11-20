export default async function run(page, ui) {
  // Create the admin account
  await page.fill('input[type=email], input[name=email]', 'admin@dyunetra.dpdns.org');
  await page.fill('input[type=password]', 'FreeLLM#2026!');
  await page.getByText('Create account', { exact: false }).first().click().catch(() => page.keyboard.press('Enter'));
  await page.waitForTimeout(5000);
  const body = (await page.locator('body').innerText()).slice(0, 500);
  await page.screenshot({ path: 'shot-fl-2.png' });
  return { url: page.url(), body };
}
