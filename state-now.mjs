export default async function run(page, ui) {
  await page.screenshot({ path: 'shot-now2.png' });
  const token = await page.evaluate(() => !!(document.querySelector('input[name="cf-turnstile-response"]') || {}).value);
  return { token, url: page.url().slice(-60), body: (await page.locator('body').innerText()).slice(0, 300) };
}
