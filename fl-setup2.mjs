export default async function run(page, ui) {
  // Fill setup code + admin account
  const codeInput = page.locator('input').nth(0);
  const inputs = await page.locator('input').count();
  // Generic: fill all text inputs in order
  const vals = ['Y4RH7F8RSY', 'admin@dyunetra.dpdns.org', 'FreeLLM#2026!', 'FreeLLM#2026!'];
  for (let i = 0; i < inputs && i < vals.length; i++) {
    const el = page.locator('input').nth(i);
    const type = await el.getAttribute('type').catch(() => 'text');
    if (type === 'hidden' || type === 'checkbox') continue;
    await el.fill(vals[i]).catch(() => { });
  }
  await page.screenshot({ path: 'shot-fl-3.png' });
  await page.getByRole('button', { name: /setup|create|start|init/i }).first().click().catch(() => page.keyboard.press('Enter'));
  await page.waitForTimeout(6000);
  const body = (await page.locator('body').innerText()).slice(0, 600);
  await page.screenshot({ path: 'shot-fl-4.png' });
  return { url: page.url(), body };
}
