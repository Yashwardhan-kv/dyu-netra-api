// The keys page references proxy settings. Find the actual POST body for key creation:
const js = await fetch('http://localhost:3001/assets/index-DglAhDS7.js').then(x => x.text());
// search for mutationFn near /api/keys POST
const all = [...js.matchAll(/`\/api\/keys`/g)].map(m => m.index);
for (const i of all) {
  const chunk = js.slice(i - 100, i + 400).replace(/\n/g, ' ');
  console.log('---', chunk.slice(0, 450));
}
