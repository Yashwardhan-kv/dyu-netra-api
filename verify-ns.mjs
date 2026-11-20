export default async function run(page, ui) {
  // Use DNS-over-HTTPS to query NS records reliably
  const out = await page.evaluate(async () => {
    const r = await fetch('https://dns.google/resolve?name=dyunetra.dpdns.org&type=NS');
    const j = await r.json();
    return { status: j.Status, ns: (j.Answer || []).map(a => a.data), authority: (j.Authority || []).map(a => a.data.slice(0, 80)) };
  });
  return out;
}
