// Deployed JS is CORRECT: toggles panel.hidden via d(!o)... wait — deployed uses
// 'open' class but NEVER sets panel.hidden! Where does hidden get set initially?
// Check the deployed HTML for hidden attr + the deployed CSS for [hidden]:
import fs from 'node:fs';
const html = fs.readFileSync('C:/Brand/dyunetra-website-source/dist/index.html', 'utf8');
const i = html.indexOf('dyu-bot-panel');
console.log('HTML:', html.slice(i - 60, i + 60));
const css = fs.readFileSync('C:/Brand/dyunetra-website-source/dist/assets/css/chatbot.css', 'utf8');
const hi = css.indexOf('[hidden]');
console.log('CSS hidden rule:', css.slice(Math.max(0, hi - 120), hi + 60) || 'NOT FOUND');
const oi = css.indexOf('.dyu-bot-panel{');
console.log('CSS panel rule:', css.slice(oi, oi + 120));
