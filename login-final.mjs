export default async function run(page, ui) {
  // All fields confirmed filled: email=yash.katkamwar..., password=Davai@2026
  // Login button is at y=507 — click by coordinates (layout-map showed exact position)
  const btn = await page.evaluate(() => {
    const els = [...document.querySelectorAll('button')];
    const b = els.find(e => e.textContent.trim() === 'Login');
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.click(btn.x, btn.y);
  await page.waitForTimeout(12000);
  return { url: page.url().slice(-60), body: (await page.locator('body').innerText()).slice(0, 350) };
}
