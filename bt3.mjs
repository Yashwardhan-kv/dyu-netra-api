// Browser engine (Chromium's BoringSSL) is the real test — from the SITE'S origin this time.
export default async function run(page, ui) {
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  const r = await page.evaluate(async () => {
    try {
      const x = await fetch('https://api.freellma.dyunetra.dpdns.org/v1/models');
      return { status: x.status, body: (await x.text()).slice(0, 300) };
    } catch (e) { return { err: e.message.slice(0, 180) }; }
  });
  return r;
}
