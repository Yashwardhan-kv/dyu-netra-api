// Diagnose: hit the worker with OPTIONS and POST, dump raw status + ACAO header
export default async function run(page, ui) {
  return await page.evaluate(async () => {
    const out = {};
    // OPTIONS preflight
    const opt = await fetch('https://dyunetra-chat.dyunetra-1inlv.workers.dev', {
      method: 'OPTIONS',
      headers: { 'Origin': 'https://dyunetra.dpdns.org', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' }
    }).catch(e => ({ err: e.message }));
    if (!opt.err) {
      out.options = { status: opt.status, acao: opt.headers.get('access-control-allow-origin') };
    } else out.options = opt;
    return out;
  });
}
