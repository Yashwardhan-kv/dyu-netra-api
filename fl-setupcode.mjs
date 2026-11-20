export default async function run(page, ui) {
  await page.setViewportSize({ width: 900, height: 700 });
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  await page.fill('input[type=email]', 'admin@dyunetra.dpdns.org');
  await page.fill('input[type=password]', 'FreeLLM#2026!');
  // setup code = input with placeholder containing "code"
  const code = page.locator('input[placeholder*="code" i]').first();
  const cnt = await code.count();
  if (cnt) {
    await code.scrollIntoViewIfNeeded();
    await code.fill('Y4RH7F8RSY');
  } else {
    // fallback: third input
    await page.locator('input >> nth=2').fill('Y4RH7F8RSY');
  }
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'shot-fl-pre.png' });
  const btn = page.locator('button:has-text("Create account")');
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await btn.click();
  await page.waitForTimeout(12000);
  await page.screenshot({ path: 'shot-fl-post.png' });
  const body = (await page.locator('body').innerText()).slice(0, 700);
  return { url: page.url(), body };
}
