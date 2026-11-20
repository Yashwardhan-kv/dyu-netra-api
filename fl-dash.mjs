export default async function run(page, ui) {
  // There are only 2 fields: Email + Password (setup code may not exist / auto-handled)
  await page.locator('input[type=email], input:visible').first().fill('admin@dyunetra.dpdns.org');
  await page.locator('input[type=password]').first().fill('FreeLLM#2026!');
  await page.getByRole('button', { name: /create/i }).click();
  await page.waitForTimeout(8000);
  const body = (await page.locator('body').innerText()).slice(0, 600);
  await page.screenshot({ path: 'shot-fl-dash.png' });
  return { url: page.url(), body };
}
