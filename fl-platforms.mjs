// Find the platform list (Ky) with "keyless" flags from the bundle
const js = await fetch('http://localhost:3001/assets/index-DglAhDS7.js').then(x => x.text());
const i = js.indexOf('keyless');
console.log(js.slice(i - 1500, i + 500).replace(/,/g, ',\n').slice(0, 2500));
