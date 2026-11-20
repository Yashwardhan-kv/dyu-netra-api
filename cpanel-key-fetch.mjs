export default async function run(page, ui) {
  await page.getByText('Generate Key / CSR', { exact: true }).first().click();
  await page.waitForTimeout(5000);
  // After regenerating, the panel may show the key and CSR directly on the form page
  const vals = await page.evaluate(() => [...document.querySelectorAll('textarea')].map(t => ({ name: t.name || t.id || t.getAttribute('aria-label') || 'unnamed', preview: t.value.slice(0, 60), full: t.value })));
  return { url: page.url().slice(-60), vals: vals.map(v => ({ name: v.name, preview: v.preview, len: v.full.length, full: v.full })) };
}
