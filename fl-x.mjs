export default async function run(page, ui) {
  await page.setViewportSize({ width: 900, height: 1000 });
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(7000);
  // fill by adjacent label text
  const fillByLabel = async (label, value) => {
    const el = page.locator(`div:has-text("${label}") > input, label:has-text("${label}") + input`).first();
    try { await el.fill(value, { timeout: 3000 }); return true; } catch { return false; }
  };
  await fillByLabel('Email', 'admin@dyunetra.dpdns.org');
  await fillByLabel('Password', 'FreeLLM#2026!');
  // setup code: input after "Setup code" label — try placeholder or nth fallback
  let ok = await fillByLabel('Setup code', 'Y4RH7F8RSY');
  if (!ok) {
    const inputs = page.locator('input:visible');
    const n = await inputs.count();
    for (let i = 0; i < n; i++) {
      const el = inputs.nth(i);
      const t = (await el.getAttribute('type')) || '';
      if (t !== 'email' && t !== 'password') { await el.fill('Y4RH7F8RSY'); ok = true; break; }
    }
  }
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'shot-flx1.png' });
  const btn = page.getByRole('button', { name: /create/i }).first();
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await btn.click();
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'shot-flx2.png' });
  const body = (await page.locator('body').innerText()).slice(0, 600);
  return { url: page.url(), body };
}
