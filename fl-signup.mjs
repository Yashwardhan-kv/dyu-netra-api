export default async function run(page, ui) {
  await page.fill('input[type=email]', 'admin@dyunetra.dpdns.org');
  await page.fill('input[type=password]', 'FreeLLM#2026!');
  await page.getByRole('button', { name: /create account/i }).click();
  await page.waitForTimeout(10000);
  const body = (await page.locator('body').innerText()).slice(0, 700);
  await page.screenshot({ path: 'shot-fl-created.png' });
  return { url: page.url(), body };
}
