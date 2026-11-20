// Try Cloudflare's own test URL via Node fetch to see if Node TLS works at all here
const a = await fetch('https://dyunetra.pages.dev').then(r => ({ status: r.status })).catch(e => ({ err: e.message.slice(0, 120) }));
console.log('pages.dev from node fetch:', JSON.stringify(a));

const b = await fetch('https://dyunetra.dpdns.org').then(r => ({ status: r.status })).catch(e => ({ err: e.message.slice(0, 120) }));
console.log('dyunetra.dpdns.org from node fetch:', JSON.stringify(b));
