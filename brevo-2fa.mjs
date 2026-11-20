export default async function run(page, ui) {
  // Find the verification code input and fill it
  const inputs = page.locator('input[type="text"], input[type="tel"], input[type="number"], input:not([type])');
  const count = await inputs.count();
  let filled = false;
  for (let i = 0; i < count; i++) {
    const el = inputs.nth(i);
    if (await el.isVisible().catch(() => false)) {
      await el.fill('854624').catch(() => { });
      filled = true;
      break;
    }
  }
  if (!filled) {
    // maybe snapshot-driven
    const snap = await ui.snapshot();
    return { filled: false, snap };
  }
  await page.waitForTimeout(500);
  // click Verify
  const verifyBtn = page.getByRole('button', { name: /verify/i });
  if (await verifyBtn.count()) {
    await verifyBtn.first().click();
  }
  await page.waitForTimeout(7000);
  return { filled, url: page.url(), title: await page.title(), body: (await page.locator('body').innerText()).slice(0, 600) };
}
