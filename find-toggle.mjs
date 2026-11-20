import fs from 'node:fs';
const c = fs.readFileSync('C:/Brand/dyunetra-website-source/chatbot-deployed.js', 'utf8');
// The minified code hides 'hidden' mangled? search for '.hidden=' patterns
const idx = c.search(/\.hidden\s*=/);
console.log('assignment at:', idx);
console.log(c.slice(Math.max(0, idx - 300), idx + 200));
