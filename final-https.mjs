export default async function run(page, ui) {
  const out = {};
  // A record via DoH — proxied records should return Cloudflare edge IPs (104.x/172.x), not 185.27.x
  out.dns = await page.evaluate(async () => {
    const r = await fetch('https://dns.google/resolve?name=dyunetra.dpdns.org&type=A');
    const j = await r.json();
    return (j.Answer || []).map(a => a.data);
  });
  try {
    const resp = await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    out.status = resp.status();
    await page.waitForTimeout(5000);
    out.title = await page.title();
  } catch (e) { out.err = e.message.slice(0, 180); }
  await page.screenshot({ path: 'shot-final-https.png' });
  return out;
}
