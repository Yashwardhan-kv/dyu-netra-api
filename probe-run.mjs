// Probe both paths from the deployed probe worker
const base = 'https://dyunetra-probe.dyunetra-1inlv.workers.dev';
const a = await fetch(base + '/test-same-zone').then(r => r.json()).catch(e => ({ err: e.message }));
console.log('same-zone (api.freellma via tunnel):', JSON.stringify(a));
const b = await fetch(base + '/test-quick').then(r => r.json()).catch(e => ({ err: e.message }));
console.log('quick tunnel:', JSON.stringify(b));
