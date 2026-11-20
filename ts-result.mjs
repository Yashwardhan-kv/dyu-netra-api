export default async function run(page, ui) {
  const token = await page.evaluate(() => !!(document.querySelector('input[name="cf-turnstile-response"]') || {}).value);
  await page.screenshot({ path: 'shot-ts.png' });
  return { token, url: page.url().slice(-50) };
}
