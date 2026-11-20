import fs from 'node:fs';
const html = fs.readFileSync('C:/Brand/dyunetra-website-source/dist/index.html', 'utf8');
const i = html.indexOf('hidden');
const j = html.indexOf('dyu-bot');
console.log('dyu-bot idx:', j, '| first hidden idx:', i);
console.log('snippet:', html.slice(j - 100, j + 300).replace(/</g, '\n<').split('\n').filter(l => l.includes('hidden') || l.includes('dyu-bot')).join('\n'));
