export default async function run(page, ui) {
  // find any iframe from challenges.cloudflare.com and click at its center-left (checkbox position)
  let target = null;
  for (const f of page.frames()) {
    if (/challenges\.cloudflare\.com/.test(f.url())) { target = f; break; }
  }
  if (!target) return { error: 'no cf frame' };
  // the checkbox input inside the frame
  const cb = target.locator('#challenge-stage input[type=checkbox], label.ctp-checkbox-label, input[type=checkbox]').first();
  try {
    const bb = await cb.boundingBox();
    if (bb) { await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(7000); }
    else { await cb.click({ timeout: 5000 }); await page.waitForTimeout(7000); }
  } catch (e) { return { error: 'click failed: ' + e.message.slice(0, 120) }; }
  const token = await page.evaluate(() => !!(document.querySelector('input[name="cf-turnstile-response"]') || {}).value);
  let login = null;
  if (token) {
    const btn = page.getByRole('button', { name: /^Login$/i }).last();
    await btn.click();
    await page.waitForTimeout(10000);
    login = { url: page.url().slice(-60), body: (await page.locator('body').innerText()).slice(0, 300) };
  }
  return { token, login };
}
