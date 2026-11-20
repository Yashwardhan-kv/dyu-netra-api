// Worker is returning 403 preflight because "null"/disallowed origins are rejected —
// but our site origin IS in the allow-list. The earlier in-site test failed too...
// because handleCORS uses ALLOWED_ORIGINS from [vars] which wrangler2.toml sets.
// BUT: worker.js references ALLOWED_ORIGINS as a bare global — in Workers vars are
// env properties, NOT globals. Fix: read from env.
