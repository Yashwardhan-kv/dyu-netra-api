export default async function run(page, ui) {
  await page.fill('input#login_field, input[name=login]', 'Yashwardhan-kv');
  await page.fill('input#password, input[name=password]', 'Developer@123');
  await page.click('input[type=submit], button[type=submit], [name*=commit]');
  await page.waitForTimeout(9000);
  return { url: page.url().slice(-60), body: (await page.locator('body').innerText()).slice(0, 400) };
}
