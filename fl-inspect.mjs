export default async function run(page, ui) {
  await page.setViewportSize({ width: 900, height: 650 });
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  // debug: dump input info BEFORE filling
  const inputs = await page.evaluate(() => [...document.querySelectorAll('input')].map((el, i) => ({
    i, type: el.type, ph: el.placeholder, name: el.name, visible: !!(el.offsetWidth || el.offsetHeight)
  })));
  await page.screenshot({ path: 'shot-dbg.png' });
  return { url: page.url(), inputs };
}
