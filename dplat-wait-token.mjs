export default async function run(page, ui) {
  // All fields filled. Just wait for turnstile then click Login.
  let token = false;
  for (let i = 0; i < 15; i++) {
    token = await page.evaluate(() => {
      const t = document.querySelector('input[name="cf-turnstile-response"]');
      return !!(t && t.value);
    });
    if (token) break;
    await page.waitForTimeout(2000);
  }
  if (!token) return { error: 'no turnstile token after 30s' };
  await page.locator('button:has-text("Login")').first().click();
  await page.waitForTimeout(10000);
  return { loggedIn: true, url: page.url().slice(-60), body: (await page.locator('body').innerText()).slice(0, 300) };
}
