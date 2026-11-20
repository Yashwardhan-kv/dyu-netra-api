export default async function run(page, ui) {
  // DigitalPlat One — maybe the login page URL is different now
  const candidates = [
    'https://dash.domain.digitalplat.org/auth/login',
    'https://dashboard.digitalplat.org/login',
    'https://dashboard.digitalplat.org/'
  ];
  const results = [];
  for (const u of candidates) {
    try {
      await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000);
      results.push({ url: page.url().slice(0, 80), text: (await page.locator('body').innerText()).slice(0, 200) });
      break;
    } catch (e) {
      results.push({ url: u, error: e.message.slice(0, 80) });
    }
  }
  return results;
}
