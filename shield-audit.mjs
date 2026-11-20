export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8787/', { waitUntil: 'load' });
  await page.waitForTimeout(7500);
  const r = {};
  // 1. context menu on image
  await page.locator('.founder-frame').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.locator('.founder-frame img').click({ button: 'right' });
  await page.waitForTimeout(500);
  r.contextMenuSuppressed = await page.evaluate(() => !document.querySelector('.context-menu, [role=menu]'));
  r.toast = await page.locator('#prot-toast').count() > 0;
  // 2. text selection
  r.userSelect = await page.evaluate(() => getComputedStyle(document.querySelector('.hero .lead')).userSelect);
  // 3. drag image
  r.imgDraggable = await page.evaluate(() => { const i = document.querySelector('.founder-frame img'); const s = getComputedStyle(i); return s.webkitUserDrag || 'n/a'; });
  // 4. ctrl+s intercept
  await page.keyboard.down('Control'); await page.keyboard.press('s'); await page.keyboard.up('Control');
  await page.waitForTimeout(400);
  r.saveToast = await page.evaluate(() => { const t = document.getElementById('prot-toast'); return t && t.textContent; });
  // 5. scripts loaded
  r.protectLoaded = await page.evaluate(() => !!document.querySelector('script[src*="protect"]'));
  // 6. headers via fetch
  const resp = await page.request.get('http://localhost:8787/');
  r.xfo = resp.headers()['x-frame-options'] || '(local serve: no htaccess)';
  await page.screenshot({ path: 'shot-shield.png' });
  return r;
}
