import fs from 'node:fs';
const p = 'C:/Brand/dyunetra-website-source/src/assets/js/chatbot.js';
let w = fs.readFileSync(p, 'utf8');
// remove the unused safeHref line
w = w.replace(/var safeHref = [^\n]+\n/, '');
fs.writeFileSync(p, w);
console.log('cleaned');
