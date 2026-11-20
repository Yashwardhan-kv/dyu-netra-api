export default async function run(page, ui) {
  const email = page.locator('input[type="email"], input[name="email"], input').first();
  await email.click();
  await email.fill('');
  await email.type('yash.katkamwar.dev@gmail.com', { delay: 30 });
  const pwd = page.locator('input[type="password"]').first();
  await pwd.click();
  await pwd.fill('');
  await pwd.type('Davai@2026', { delay: 30 });
  await page.waitForTimeout(1000);
  const loginBtn = page.getByRole('button', { name: /^Login$/ });
  await loginBtn.click();
  await page.waitForTimeout(9000);
  return { url: page.url(), title: await page.title(), body: (await page.locator('body').innerText()).slice(0, 800) };
}
