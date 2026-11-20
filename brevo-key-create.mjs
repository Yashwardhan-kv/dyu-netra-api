export default async function run(page, ui) {
  // Fill the key name
  const nameInput = page.locator('input').nth(-1); // last visible input = name field
  const inputs = page.locator('input:not([type="hidden"])');
  const n = await inputs.count();
  for (let i = n - 1; i >= 0; i--) {
    const el = inputs.nth(i);
    if (await el.isVisible().catch(() => false)) {
      const type = await el.getAttribute('type');
      if (type === 'text' || type === null) {
        await el.fill('dyunetra-outgoing');
        break;
      }
    }
  }
  await page.getByRole('button', { name: /^Generate$/i }).first().click();
  await page.waitForTimeout(8000);
  const body = (await page.locator('body').innerText()).slice(0, 2000);
  // Also grab any input values (the key is often shown in a readonly input/copy box)
  const vals = await page.evaluate(() => [...document.querySelectorAll('input, textarea')].map(e => e.value).filter(v => v && v.length > 10));
  return { url: page.url(), body, vals };
}
