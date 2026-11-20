export default async function run(page, ui) {
  await page.reload({ waitUntil: 'networkidle', timeout: 45000 }).catch(() => { });
  await page.waitForTimeout(3000);
  // fill again after reload
  const email = page.locator('#login-email');
  await email.waitFor({ state: 'visible', timeout: 15000 });
  await email.click(); await email.fill('yash.katkamwar.dev@gmail.com');
  const pwd = page.locator('#login-password');
  await pwd.click(); await pwd.fill('Davai@2026');
  // poll for turnstile token
  let res = {};
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(3000);
    res = await page.evaluate(() => {
      const t = document.querySelector('input[name="cf-turnstile-response"]');
      const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Login');
      return {
        token: t ? t.value : null,
        disabled: btn ? btn.disabled : null,
        frames: [...document.querySelectorAll('iframe')].map(f => f.src.slice(0, 60))
      };
    });
    if (res.disabled === false) break;
  }
  if (res.disabled === false) {
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(9000);
    return { clicked: true, url: page.url(), body: (await page.locator('body').innerText()).slice(0, 500) };
  }
  return { clicked: false, res };
}
