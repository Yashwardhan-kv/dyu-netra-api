export default async function run(page, ui) {
  // Simplified: fill all three via explicit types + placeholder scan
  await page.setViewportSize({ width: 900, height: 650 });
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  const inputs = page.locator('input');
  const total = await inputs.count();
  const log = [];
  for (let i = 0; i < total; i++) {
    const el = inputs.nth(i);
    const type = (await el.getAttribute('type')) || 'text';
    const ph = ((await el.getAttribute('placeholder')) || '').toLowerCase();
    if (type === 'email') { await el.fill('admin@dyunetra.dpdns.org'); log.push(i + ':email'); }
    else if (type === 'password') { await el.fill('FreeLLM#2026!'); log.push(i + ':pw'); }
    else if (/code/.test(ph)) { await el.fill('Y4RH7F8RSY'); log.push(i + ':code'); }
  }
  await page.screenshot({ path: 'shot-flx-pre.png' });
  const btn = page.locator('button', { hasText: /create/i }).last();
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(12000);
  await page.screenshot({ path: 'shot-flx-post.png' });
  const body = (await page.locator('body').innerText()).slice(0, 600);
  return { log, url: page.url(), body };
}
