// HTTPS now serves a valid LE cert! Fetch the full page.
const r = await fetch('https://dyunetra.dpdns.org/', { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DyunetraBot/1.0)' } });
const text = await r.text();
console.log('status:', r.status);
console.log('title:', (text.match(/<title>([^<]*)<\/title>/i) || [])[1]);
console.log('our site:', /Dyunetra|DYUNETRA/i.test(text), '| length:', text.length);
