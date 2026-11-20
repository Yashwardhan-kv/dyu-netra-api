// grep the bundle for the keys POST body shape
const js = await fetch('http://localhost:3001/assets/index-DglAhDS7.js').then(x => x.text());
const idx = js.indexOf('/api/keys');
console.log('context:', js.slice(Math.max(0, idx - 400), idx + 200).replace(/\n/g, ' ').slice(0, 600));
