export default async function run(page, ui) {
  const out = {};
  // A record via DoH
  out.a = await page.evaluate(async () => {
    const r = await fetch('https://dns.google/resolve?name=dyunetra.dpdns.org&type=A');
    const j = await r.json();
    return (j.Answer || []).map(a => a.data);
  });
  // HTTPS page load
  try {
    const resp = await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    out.httpsStatus = resp.status();
    await page.waitForTimeout(4000);
    out.title = await page.title();
  } catch (e) {
    out.httpsErr = e.message.slice(0, 150);
  }
  await page.screenshot({ path: 'shot-https-final.png' });
  return out;
}
