// OPTIONS returns 204 but ACAO header is MISSING — the [vars] didn't reach handleCORS.
// Because globalThis.ALLOWED_ORIGINS is set in fetch() BEFORE handleCORS is called,
// yet handleCORS reads the bare global... check: maybe wrangler2.toml [vars] didn't
// deploy. Add a debug route that echoes the env value.
