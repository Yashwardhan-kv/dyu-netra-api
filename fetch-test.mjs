// Verify HTTPS via public CF edge with proper SNI — use fetch (system trust store) instead
const r = await fetch('https://dyunetra.dpdns.org/', { redirect: 'follow' });
const text = await r.text();
console.log('status:', r.status);
console.log('is our site:', /Dyunetra|DYUNETRA/i.test(text));
console.log('title match:', (text.match(/<title>([^<]*)<\/title>/i) || [])[1]);
