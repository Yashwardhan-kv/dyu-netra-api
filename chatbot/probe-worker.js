export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/test-same-zone') {
      try {
        const r = await fetch('https://api.freellma.dyunetra.dpdns.org/v1/models', { headers: { Authorization: 'Bearer ' + (env.UPSTREAM_API_KEY || '') } });
        const t = await r.text();
        return new Response(JSON.stringify({ status: r.status, body: t.slice(0, 200) }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ err: String(e.message).slice(0, 200) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }
    if (url.pathname === '/test-quick') {
      try {
        const r = await fetch('https://quantities-works-marketplace-guided.trycloudflare.com/v1/models');
        const t = await r.text();
        return new Response(JSON.stringify({ status: r.status, body: t.slice(0, 200) }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ err: String(e.message).slice(0, 200) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }
    return new Response('add /test-same-zone or /test-quick');
  }
};
