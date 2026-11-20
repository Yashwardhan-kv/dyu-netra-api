export default async function run(page, ui) {
  // "E-Mail" is a method-choice element; click it specifically
  const em = page.getByText('E-Mail', { exact: true }).first();
  await em.click({ timeout: 5000 }).catch(async () => {
    // alternative: might be a link/button
    await page.locator('a:has-text("E-Mail"), button:has-text("E-Mail"), div:has-text("E-Mail")').first().click();
  });
  await page.waitForTimeout(3000);
  return { url: page.url().slice(-60), body: (await page.locator('body').innerText()).slice(0, 400) };
}
