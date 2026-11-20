export default async function run(page, ui) {
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  const r = await page.evaluate(async () => {
    try {
      const x = await fetch('https://dyunetra-chat.dyunetra-1inlv.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'What is MEVONU? (one sentence)' }] })
      });
      return { status: x.status, body: (await x.text()).slice(0, 300) };
    } catch (e) { return { err: e.message.slice(0, 150) }; }
  });
  return r;
}
