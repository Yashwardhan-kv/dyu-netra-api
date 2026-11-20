export default async function run(page, ui) {
  await page.fill('#login_field', 'Yashwardhan-kv');
  await page.fill('#password', 'Dyunetra@2026');
  await page.click('[name=commit]');
  await page.waitForTimeout(10000);
  return { url: page.url().slice(0, 90), body: (await page.locator('body').innerText()).slice(0, 250) };
}
