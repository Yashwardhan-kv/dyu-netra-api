// Test quick tunnel → FreeLLMAPI
const url = 'https://basement-youth-angels-oops.trycloudflare.com';
const r = await fetch(url + '/v1/models').catch(e => ({ err: (e.cause && e.cause.message) || e.message }));
if (r.err) console.log('ERR:', r.err);
else {
  console.log('status:', r.status);
  console.log('body:', (await r.text()).slice(0, 250));
}
