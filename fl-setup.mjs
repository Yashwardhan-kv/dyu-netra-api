export default async function run(page, ui) {
  // FreeLLMAPI dashboard setup — enter first-run code, get unified key
  await page.goto('http://localhost:3001', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'shot-fl-setup.png' });
  const body = (await page.locator('body').innerText()).slice(0, 600);
  return { url: page.url(), body };
}
