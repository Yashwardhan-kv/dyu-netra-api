export default async function run(page, ui) {
  // email + password already filled; fill setup code (3rd input) and scroll-submit
  const inputs = page.locator('input:visible');
  const n = await inputs.count();
  // find the input whose placeholder mentions 'code'
  let codeFilled = false;
  for (let i = 0; i < n; i++) {
    const el = inputs.nth(i);
    const ph = (await el.getAttribute('placeholder')) || '';
    if (/code/i.test(ph)) {
      await el.scrollIntoViewIfNeeded();
      await el.fill('Y4RH7F8RSY');
      codeFilled = true;
      break;
    }
  }
  if (!codeFilled) {
    // fallback: 3rd input
    const el = inputs.nth(2);
    await el.scrollIntoViewIfNeeded();
    await el.fill('Y4RH7F8RSY');
  }
  await page.waitForTimeout(400);
  const btn = page.locator('button:has-text("Create account")');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(9000);
  const body = (await page.locator('body').innerText()).slice(0, 600);
  await page.screenshot({ path: 'shot-fl-success.png' });
  return { url: page.url(), body };
}
