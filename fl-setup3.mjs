export default async function run(page, ui) {
  // Field order: [0]=setup code (first box), [1]=email, [2]=password, [3]=confirm?
  const inputs = page.locator('input:visible');
  const n = await inputs.count();

  // Identify by type/placeholder
  let emailDone = false, pwDone = false;
  for (let i = 0; i < n; i++) {
    const el = inputs.nth(i);
    const type = (await el.getAttribute('type')) || 'text';
    const ph = (await el.getAttribute('placeholder')) || '';
    if (type === 'email' || ph.toLowerCase().includes('email')) { await el.fill('admin@dyunetra.dpdns.org'); emailDone = true; continue; }
    if (type === 'password') { await el.fill('FreeLLM#2026!'); pwDone = true; continue; }
  }
  // The remaining text input (first non-email/password visible) gets the code
  for (let i = 0; i < n; i++) {
    const el = inputs.nth(i);
    const type = (await el.getAttribute('type')) || 'text';
    if (type === 'text') { await el.fill('Y4RH7F8RSY'); break; }
  }
  await page.screenshot({ path: 'shot-fl-5.png' });
  await page.getByRole('button', { name: /create/i }).first().click().catch(() => { });
  await page.waitForTimeout(6000);
  const body = (await page.locator('body').innerText()).slice(0, 500);
  await page.screenshot({ path: 'shot-fl-6.png' });
  return { url: page.url(), body };
}
