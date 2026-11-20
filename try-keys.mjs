// Dashboard is up. FreeLLMAPI unified keys usually look like freellmapi-... and are
// created via the dashboard. Try the ENCRYPTION_KEY as bearer first, else check /docs
// for the API to create one programmatically.
const key = 'c03202a4f3f0c01d2b207e33f3f0fde09711712dd3116925d4ab87351047fc3a';

for (const [p, k] of [['/v1/models', key], ['/v1/models', 'freellmapi-' + key]]) {
  const r = await fetch('http://localhost:3001' + p, { headers: { Authorization: 'Bearer ' + k } }).catch(e => ({ err: e.message }));
  if (r.err) { console.log(p, 'ERR', r.err); continue; }
  console.log(p, 'with key ending', k.slice(-8), '→', r.status);
  if (r.status === 200) console.log((await r.text()).slice(0, 200));
}
