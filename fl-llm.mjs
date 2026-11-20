// Those were SEARCH providers. Find the LLM platforms list (Groq, etc.) with keyless flags
const js = await fetch('http://localhost:3001/assets/index-DglAhDS7.js').then(x => x.text());
const i = js.indexOf('groq');
console.log(js.slice(i - 300, i + 3000).slice(0, 3500));
