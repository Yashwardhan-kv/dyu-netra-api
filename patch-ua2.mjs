import fs from 'node:fs';
const p = 'C:/Brand/dyunetra-website-source/chatbot/worker.js';
let w = fs.readFileSync(p, 'utf8');
w = w.replace(
  "headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (env.UPSTREAM_API_KEY || '') },",
  "headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (env.UPSTREAM_API_KEY || ''), 'User-Agent': 'DyunetraAssistant/1.0' },"
);
fs.writeFileSync(p, w);
console.log('UA patched:', w.includes('DyunetraAssistant/1.0'));
