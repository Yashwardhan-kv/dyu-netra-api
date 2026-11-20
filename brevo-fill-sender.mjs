export default async function run(page, ui) {
  // Try to find name & email inputs by placeholder
  const nameInput = page.locator('input[placeholder="John Doe"]');
  const emailInput = page.locator('input[placeholder="john.doe@email.com"]');
  await nameInput.fill('Dyunetra');
  await emailInput.fill('founder@dyunetra.dpdns.org');
  await page.waitForTimeout(500);
  // click "Add sender"
  await page.getByRole('button', { name: /add sender/i }).click();
  await page.waitForTimeout(6000);
  return { url: page.url(), body: (await page.locator('body').innerText()).slice(0, 1500) };
}
