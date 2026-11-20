// Find the click handler in the deployed minified JS
import fs from 'node:fs';
const c = fs.readFileSync('C:/Brand/dyunetra-website-source/chatbot-deployed.js', 'utf8');
const fabIdx = c.indexOf('dyu-bot-fab');
const lastAdd = c.lastIndexOf('addEventListener(', fabIdx);
console.log(c.slice(lastAdd, lastAdd + 550));
