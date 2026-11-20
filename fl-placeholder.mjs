// Fill Setup code (placeholder "code from the server logs") then submit
export default async function run(page, ui) {
  await page.setViewportSize({ width: 760, height: 900 });
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  await page.fill('input[type=email]', 'admin@dyunetra.dpdns.org');
  await page.fill('input[type=password]', 'FreeLLM#2026!');
  // setup code by placeholder
  const code = page.locator('input[placeholder*="code" i], input[placeholder*="server" i]').first();
  await code.scrollIntoViewIfNeeded();
  await code.fill('Y4RH7F8RSY');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'shot-pre-submit.png' });
  await page.locator('button:has-text("Create account")').click();
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'shot-post-submit.png' });
  const body = (await page.locator('body').innerText()).slice(0, 600);
  return { url: page.url(), body };
}
