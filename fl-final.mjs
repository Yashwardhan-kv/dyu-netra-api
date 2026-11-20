export default async function run(page, ui) {
  // Setup code field is the 3rd visible input; button is below fold
  await page.fill('input[type=email]', 'admin@dyunetra.dpdns.org');
  await page.fill('input[type=password]', 'FreeLLM#2026!');
  const code = page.locator('input >> nth=2');
  if (await code.count()) { await code.scrollIntoViewIfNeeded(); await code.fill('Y4RH7F8RSY'); }
  const btn = page.locator('button:has-text("Create account")');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(9000);
  const body = (await page.locator('body').innerText()).slice(0, 600);
  await page.screenshot({ path: 'shot-fl-final.png' });
  return { url: page.url(), body };
}
