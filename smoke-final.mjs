export default async function run(page, ui) {
  await page.goto('https://dyunetra.dpdns.org/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  const r = await page.evaluate(async () => {
    const x = await fetch('https://dyunetra-chat.dyunetra-1inlv.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'What is MEVONU? one sentence' }] })
    });
    return { status: x.status, acao: x.headers.get('access-control-allow-origin'), body: (await x.text()).slice(0, 400) };
  });
  return r;
}
