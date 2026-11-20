// Find key-creation API in /docs or OpenAPI spec
const spec = await fetch('http://localhost:3001/openapi.json').catch(() => null);
if (spec && spec.ok) { console.log((await spec.text()).slice(0, 2000)); }
else {
  const docs = await fetch('http://localhost:3001/docs').then(r => r.text());
  const m = docs.match(/(\/api\/[a-z\/-]+)/g);
  console.log('routes in /docs:', [...new Set(m || [])].slice(0, 30));
  // look for keys-related mentions
  const idx = docs.toLowerCase().indexOf('key');
  console.log('...key context:', docs.slice(Math.max(0, idx - 100), idx + 300));
}
