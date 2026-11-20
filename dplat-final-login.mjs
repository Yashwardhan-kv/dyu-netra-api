export default async function run(page, ui) {
  // scroll the password field into view and find the login/submit button after it
  const pw = page.locator('input[type=password]').first();
  await pw.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  // Look for a submit button below the password (may be input or button, text Login/Sign in)
  const candidates = [
    'button[type=submit]',
    'input[type=submit]',
    'button:has-text("Login")',
    'button:has-text("Sign in")',
    'input[value*="ogin"]',
    'input[value*="ign"]'
  ];
  for (const sel of candidates) {
    const b = page.locator(sel).last();
    if (await b.count() && await b.isVisible().catch(() => false)) {
      await b.click();
      await page.waitForTimeout(10000);
      return { clicked: sel, url: page.url().slice(-50), body: (await page.locator('body').innerText()).slice(0, 300) };
    }
  }
  // fallback: Enter key
  await pw.press('Enter');
  await page.waitForTimeout(10000);
  return { clicked: 'Enter', url: page.url().slice(-50), body: (await page.locator('body').innerText()).slice(0, 300) };
}
