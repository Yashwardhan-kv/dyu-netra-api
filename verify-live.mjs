export default async function run(page, ui) {
  const out = {};
  try {
    const resp = await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    out.status = resp.status();
    await page.waitForTimeout(6000);
    out.title = await page.title();
  } catch (e) { out.err = e.message.slice(0, 200); }
  await page.screenshot({ path: 'shot-final.png' });
  return out;
}
