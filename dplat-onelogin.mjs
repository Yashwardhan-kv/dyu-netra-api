export default async function run(page, ui) {
  // "E-Mail" and "Password" may be text labels next to inputs. Fill both by type.
  const email = page.locator('input[type=email], input[name=email]').first();
  await email.fill('yash.katkamwar.dev@gmail.com');
  const pw = page.locator('input[type=password]').first();
  await pw.fill('Davai@2026');
  await page.waitForTimeout(1000);
  // find the Login button (role or input)
  const btn = page.locator('button:has-text("Login"), input[value="Login"]').first();
  await btn.click().catch(() => page.keyboard.press('Enter'));
  await page.waitForTimeout(10000);
  return { url: page.url().slice(-50), body: (await page.locator('body').innerText()).slice(0, 350) };
}
