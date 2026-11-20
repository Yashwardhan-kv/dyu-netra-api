// The field name must be different (maybe "type" or the body shape differs).
// Fetch the /api-docs JS bundle and grep for the POST /api/keys request shape.
const d = await fetch('http://localhost:3001/api-docs').then(x => x.text());
// find script src
const srcs = [...d.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
console.log('scripts:', srcs.slice(0, 5));
for (const s of srcs.slice(0, 3)) {
  const js = await fetch('http://localhost:3001' + s).then(x => x.text());
  const i = js.indexOf('"/api/keys"');
  if (i > -1) {
    console.log('found in', s, 'context:', js.slice(i - 300, i + 300));
    break;
  }
}
