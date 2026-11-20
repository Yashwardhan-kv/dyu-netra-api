export default async function run(page, ui) {
  await page.goto('https://cpanel.freehosting.digitalplat.org/panel/indexpl.php?option=sslconfigure&domain_name=dyunetra.dpdns.org', { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  // look for any visible CSR text on page
  const text = await page.locator('body').innerText();
  const ta = await page.evaluate(() => [...document.querySelectorAll('textarea')].map(t => ({ name: t.name, len: t.value.length, head: t.value.slice(0, 60) })));
  const csrMatch = text.match(/-----BEGIN CERTIFICATE REQUEST-----[\s\S]{0,40}/);
  return { url: page.url().slice(-70), ta, hasCsrText: !!csrMatch };
}
