// Wait 20s then probe same-zone fetch from the probe worker
await new Promise(r => setTimeout(r, 20000));
const base = 'https://dyunetra-probe.dyunetra-1inlv.workers.dev';
const a = await fetch(base + '/test-same-zone').then(r => r.json()).catch(e => ({ err: e.message }));
console.log('tunnel fetch now:', JSON.stringify(a).slice(0, 300));
