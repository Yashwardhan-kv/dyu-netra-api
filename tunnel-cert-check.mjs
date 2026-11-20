// Check if the tunnel hostname now has a valid cert (via browser TLS context)
export default async function run(page, ui) {
  await new Promise(r => setTimeout(r, 15000)); // let cert propagate
  const r = await page.evaluate(async () => {
    try {
      const x = await fetch('https://api.freellma.dyunetra.dpdns.org/v1/models', { headers: { Authorization: 'Bearer freellmapi-ddfd4fac01b3617b670acec4c8c34a6fd3353380bf2d7f29' } });
      return { status: x.status, body: (await x.text()).slice(0, 150) };
    } catch (e) { return { err: e.message.slice(0, 150) }; }
  });
  return r;
}
