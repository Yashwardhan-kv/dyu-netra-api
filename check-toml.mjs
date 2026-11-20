// The tunnel works with model:'auto' locally. So the Worker's fetch must be failing
// on DNS/IPv6 or the "<!doctype" response — that HTML came from the worker fetching
// with a WRONG path. Base in wrangler2: "https://YOUR-FREELLMAPI-HOST/v1"?? No —
// deploy-chat.ps1 overrides with --var. But --var MERGES? Also MODEL var is "auto"
// in wrangler2 — but I replaced wrangler.toml... check current chatbot/wrangler.toml:
const t = require('fs').readFileSync('C:\\Brand\\dyunetra-website-source\\chatbot\\wrangler.toml', 'utf8');
console.log(t);
