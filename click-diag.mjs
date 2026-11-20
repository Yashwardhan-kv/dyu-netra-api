// Check: does click change classes? Is fab behind an overlay? Screenshot both states.
export default async function run(page, ui) {
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(9000);
  const fab = page.locator('.dyu-bot-fab');
  await fab.scrollIntoViewIfNeeded();
  const before = { hidden: await page.locator('.dyu-bot-panel').evaluate(el => el.hidden), cls: await page.locator('.dyu-bot-panel').getAttribute('class') };
  await fab.click({ force: true });
  await page.waitForTimeout(2000);
  const after = { hidden: await page.locator('.dyu-bot-panel').evaluate(el => el.hidden), cls: await page.locator('.dyu-bot-panel').getAttribute('class') };
  await page.screenshot({ path: 'shot-after-click.png' });
  return { before, after };
}
