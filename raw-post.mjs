// Raw POST from a context with the origin header (curl can't set Origin via node https easily — use fetch with no-cors off)
// Actually simplest: use page.request (browser context) which sends Origin automatically
export default async function run(page, ui) {
  const r = await page.request.post('https://dyunetra-chat.dyunetra-1inlv.workers.dev', {
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://dyunetra.dpdns.org' },
    data: { messages: [{ role: 'user', content: 'What is MEVONU? one sentence' }] }
  });
  return { status: r.status(), acao: r.headers()['access-control-allow-origin'] || '(none)', body: (await r.text()).slice(0, 400) };
}
