export default async function run(page, ui) {
  // scroll down to reveal setup code field
  await page.keyboard.press('Tab'); // move focus through fields
  const codeField = page.locator('input:visible').nth(2); // 0=email, 1=password, 2=setup code
  await codeField.scrollIntoViewIfNeeded();
  await codeField.fill('Y4RH7F8RSY');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shot-fl-7.png' });
  // submit — scroll to button first
  const btn = page.getByRole('button', { name: /create/i }).last();
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(7000);
  const body = (await page.locator('body').innerText()).slice(0, 600);
  await page.screenshot({ path: 'shot-fl-8.png' });
  return { url: page.url(), body };
}
