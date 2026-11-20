export default async function run(page, ui) {
  await page.goto('https://app.brevo.com/settings/keys/api', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => { });
  await page.waitForTimeout(8000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 1800) };
}
