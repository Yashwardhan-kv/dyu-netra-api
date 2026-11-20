export default async function run(page, ui) {
  const text = await page.locator('body').innerText();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  // find SSL-related menu items
  const sslLines = lines.filter(l => /ssl|tls|https|security|let'?s encrypt/i.test(l));
  return { sslLines: sslLines.slice(0, 15), total: lines.length };
}
