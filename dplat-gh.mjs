export default async function run(page, ui) {
  await page.goto('https://dashboard.digitalplat.org/auth/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  // Click GitHub sign-in
  await page.getByText('Sign in with GitHub', { exact: false }).first().click();
  await page.waitForTimeout(8000);
  const url1 = page.url();
  // GitHub login page: fill username + password
  if (/github\.com/.test(url1)) {
    await page.fill('#login_field', 'Yashwardhan-kv');
    await page.fill('#password', 'Developer@123');
    await page.click('[name=commit], input[type=submit]');
    await page.waitForTimeout(12000);
  }
  return { url1: url1.slice(0, 90), final: page.url().slice(0, 110), body: (await page.locator('body').innerText()).slice(0, 300) };
}
