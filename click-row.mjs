export default async function run(page, ui) {
  // The "Choose a sign-in method" — click E-Mail row first
  const emailRow = page.getByText('E-Mail', { exact: false }).first();
  const box = await emailRow.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }
  await page.waitForTimeout(3500);
  return { after: (await page.locator('body').innerText()).slice(0, 400) };
}
