export default async function run(page, ui) {
  await page.fill('input#login_field', 'yashwardhan.katkamwar@gmail.com').catch(() => { });
  await page.fill('input#password', 'Developer@123');
  await page.click('[name=commit]');
  await page.waitForTimeout(9000);
  return { url: page.url().slice(-60), body: (await page.locator('body').innerText()).slice(0, 300) };
}
