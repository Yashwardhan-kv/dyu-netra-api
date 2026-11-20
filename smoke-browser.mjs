export default async function run(page, ui) {
  // Browser TLS stack handles workers.dev fine
  const r = await page.evaluate(async () => {
    try {
      const x = await fetch('https://dyunetra-chat.dyunetra-1inlv.workers.dev', {
        method: 'POST',
        headers: { 'Origin': 'https://dyunetra.dpdns.org', 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'What is MEVONU?' }] })
      });
      return { status: x.status, body: (await x.text()).slice(0, 250) };
    } catch (e) { return { err: e.message.slice(0, 150) }; }
  });
  return r;
}
