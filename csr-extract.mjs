export default async function run(page, ui) {
  await page.goto('https://cpanel.freehosting.digitalplat.org/panel/indexpl.php?option=sslconfigure&domain_name=dyunetra.dpdns.org', { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  const vals = await page.evaluate(() => {
    const k = document.querySelector('textarea[name=key]');
    const c = document.querySelector('textarea[name=csr]');
    return { key: k ? k.value : null, csr: c ? c.value : null };
  });
  return vals;
}
