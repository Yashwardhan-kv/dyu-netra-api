export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://dyunetra.dpdns.org/contact.html', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  // fill the form
  await page.fill('#name', 'Pipeline Verification Bot');
  await page.fill('#email', 'verify@dyunetra.dpdns.org');
  await page.fill('#message', 'Automated end-to-end contact form test. Safe to delete.');
  // honeypot stays empty; wait >3s for time heuristic
  await page.waitForTimeout(4000);
  await page.click('#contact-form button[type=submit]');
  await page.waitForTimeout(6000);
  const status = await page.evaluate(() => (document.querySelector('#contact-form .status') || {}).textContent);
  await page.screenshot({ path: 'shot-contact-test.png' });
  return { status };
}
