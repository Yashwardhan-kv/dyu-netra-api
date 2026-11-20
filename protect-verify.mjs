export default async function run(page, ui) {
  await page.waitForTimeout(9000);
  // Try to open context menu on an image — should be prevented
  await page.locator('#founder-teaser').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  let ctxBlocked = false, toastShown = false;
  try { await page.locator('.founder-frame img').click({ button: 'right' }); await page.waitForTimeout(600); ctxBlocked = true; } catch { ctxBlocked = false; }
  toastShown = await page.locator('#prot-toast').count() > 0;
  await page.screenshot({ path: 'shot-protect.png' });
  // Check select-none applied
  const selectable = await page.evaluate(() => getComputedStyle(document.querySelector('#founder-teaser .lead')).userSelect);
  return { ctxBlocked, toastShown, selectable };
}
