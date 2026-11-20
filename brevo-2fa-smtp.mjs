export default async function run(page, ui) {
  // Fill the 6-digit verification code
  const codeInput = page.locator('input').filter(async el => true); // fallback below
  const inputs = page.locator('input:not([type="hidden"])');
  const n = await inputs.count();
  let filled = false;
  for (let i = 0; i < n; i++) {
    const el = inputs.nth(i);
    const type = await el.getAttribute('type').catch(() => '');
    if (type === 'tel' || type === 'text' || type === 'number' || type === null) {
      if (await el.isVisible().catch(() => false)) {
        const val = await el.inputValue().catch(() => '');
        if (!val || val.length < 4) {
          await el.click();
          await el.fill('832886');
          filled = true;
          break;
        }
      }
    }
  }
  if (!filled) {
    // modal inputs may need direct targeting
    const dlg = page.locator('input[maxlength="6"], input[autocomplete="one-time-code"]');
    if (await dlg.count()) { await dlg.first().fill('832886'); filled = true; }
  }
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /^Verify$/i }).first().click();
  await page.waitForTimeout(8000);
  return { filled, url: page.url(), body: (await page.locator('body').innerText()).slice(0, 1800) };
}
