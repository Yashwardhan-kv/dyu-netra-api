// Browser context (Chromium TLS) — final reachability test from a real browser engine
export default async function run(page, ui) {
  try {
    const x = await page.evaluate(async () => {
      const r = await fetch('https://api.freellma.dyunetra.dpdns.org/v1/models');
      return { status: r.status, body: (await r.text()).slice(0, 200) };
    });
    return x;
  } catch (e) { return { err: e.message.slice(0, 180) }; }
}
