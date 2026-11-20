export default async function run(page, ui) {
  // click turnstile inside its iframe
  for (const f of page.frames()) {
    if (/challenges\.cloudflare\.com/.test(f.url())) {
      try { await f.locator('input[type=checkbox]').click({ timeout: 4000, force: true }); } catch (e) { }
      try { await f.locator('.ctp-checkbox-label').click({ timeout: 3000, force: true }); } catch (e) { }
    }
  }
  await page.waitForTimeout(6000);
  const token = await page.evaluate(() => !!(document.querySelector('input[name="cf-turnstile-response"]') || {}).value);
  let loginResult = null;
  if (token) {
    const btn = page.getByRole('button', { name: /^Login$/i }).last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(10000);
    loginResult = { url: page.url().slice(-50), body: (await page.locator('body').innerText()).slice(0, 400) };
  }
  return { token, loginResult };
}
