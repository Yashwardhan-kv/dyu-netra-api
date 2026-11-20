export default async function run(page, ui) {
  await page.goto('https://cpanel.freehosting.digitalplat.org/index.php', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  if (await page.locator('input[type=password]').count()) {
    await page.fill('input[type=text], input[name=username]', 'alalr_43402952');
    await page.fill('input[type=password]', 'GkvD9zBcyAG9j89POYlvuT0RRqzh');
    await page.click('button[type=submit], input[type=submit]').catch(() => page.keyboard.press('Enter'));
    await page.waitForTimeout(9000);
  }
  const approve = page.getByText('I Approve');
  if (await approve.count()) { await approve.first().click(); await page.waitForTimeout(5000); }
  const text = (await page.locator('body').innerText()).slice(0, 1500);
  return { url: page.url().slice(0, 90), text };
}
