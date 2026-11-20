export default async function run(page, ui) {
  // Wait up to 30s for turnstile token to populate and login to enable
  let token = '', enabled = false;
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(2000);
    const st = await page.evaluate(() => {
      const t = document.querySelector('input[name="cf-turnstile-response"]');
      const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Login');
      return { token: t ? t.value : null, disabled: btn ? btn.disabled : null, frames: document.querySelectorAll('iframe').length };
    });
    token = st.token || ''; enabled = st.disabled === false;
    if (enabled) break;
  }
  if (enabled) {
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(9000);
  }
  return { tokenPresent: !!token, loginEnabled: enabled, url: page.url(), body: (await page.locator('body').innerText()).slice(0, 600) };
}
