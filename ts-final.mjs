export default async function run(page, ui) {
  // The turnstile widget box: click by viewport position (checkbox at ~x=207,y=93 per screenshot)
  const box = await page.evaluate(() => {
    const w = document.querySelector('.cf-turnstile');
    if (!w) return null;
    const r = w.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  if (!box) return { error: 'no widget' };
  // checkbox is roughly 20px in from left, vertically centered in the ~65px-high widget
  const cx = box.x + 22, cy = box.y + Math.min(box.h / 2, 33);
  await page.mouse.click(cx, cy);
  await page.waitForTimeout(7000);
  const token = await page.evaluate(() => !!(document.querySelector('input[name="cf-turnstile-response"]') || {}).value);
  let login = null;
  if (token) {
    const btn = page.getByRole('button', { name: /^Login$/i }).last();
    await btn.click();
    await page.waitForTimeout(10000);
    login = { url: page.url().slice(-60), body: (await page.locator('body').innerText()).slice(0, 300) };
  }
  return { box, clicked: [cx, cy], token, login };
}
