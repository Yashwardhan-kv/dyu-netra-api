// Echo env to debug what vars the worker sees
export default {
  async fetch(request, env) {
    return new Response(JSON.stringify({
      hasBase: !!env.UPSTREAM_BASE_URL,
      base: env.UPSTREAM_BASE_URL ? env.UPSTREAM_BASE_URL.slice(0, 30) : null,
      origins: env.ALLOWED_ORIGINS || null,
      model: env.MODEL || null
    }), { headers: { 'Content-Type': 'application/json' } });
  }
};
