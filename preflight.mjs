export default async function run(page, ui) {
  // Preflight OPTIONS to see what the worker returns
  const out = {};
  for (const path of ['/', '/v1/chat/completions']) {
    try {
      const x = await page.evaluate(async (u) => {
        const x = await fetch(u, {
          method: 'OPTIONS',
          headers: {
            'Origin': 'https://dyunetra.dpdns.org',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type'
          }
        }).catch(e => ({ err: e.message }));
        if (x.err) return x;
        const h = {};
        x.headers.forEach((v, k) => h[k] = v);
        return { status: x.status, headers: h };
      }, 'https://dyunetra-chat.dyunetra-1inlv.workers.dev' + path);
      out[path] = x;
    } catch (e) { out[path] = { err: String(e).slice(0, 120) }; }
  }
  return out;
}
