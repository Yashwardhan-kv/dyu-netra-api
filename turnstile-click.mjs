export default async function run(page, ui) {
  // Turnstile renders in an iframe; find its checkbox
  const frames = page.frames();
  let clicked = false;
  for (const f of frames) {
    if (/challenges\.cloudflare\.com/.test(f.url())) {
      try {
        const cb = f.locator('input[type=checkbox], .ctp-checkbox-label').first();
        await cb.click({ timeout: 5000 });
        clicked = true;
        break;
      } catch (e) { /* try next */ }
    }
  }
  await page.waitForTimeout(6000);
  // check token
  const token = await page.evaluate(() => {
    const t = document.querySelector('input[name="cf-turnstile-response"]');
    return !!(t && t.value);
  });
  return { clicked, token };
}
