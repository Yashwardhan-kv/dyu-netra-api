export default async function run(page, ui) {
  await page.goto('https://app.brevo.com/senders/domain/add?domain=dyunetra.dpdns.org', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => { });
  await page.waitForTimeout(6000);
  const btn = page.getByRole('button', { name: /verify records/i });
  if (await btn.count()) {
    await btn.first().click();
    await page.waitForTimeout(10000);
  }
  const body = (await page.locator('body').innerText()).slice(0, 2500);
  return { url: page.url(), body };
}
