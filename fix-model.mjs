// Worker responds fast on non-AI paths (3.8s includes cold start). The hang is in
// ai.run with the -fast model — that model name may not exist! The earlier direct
// API test of llama-3.1-8b-instruct took 6s+ and worked. Revert to instruct model
// but keep max_tokens low + the timeout race:
import fs from 'node:fs';
const p = 'C:/Brand/dyunetra-website-source/chatbot/worker.js';
let w = fs.readFileSync(p, 'utf8');
w = w.replace('@cf/meta/llama-3.1-8b-fast', '@cf/meta/llama-3.1-8b-instruct');
fs.writeFileSync(p, w);
console.log('model reverted to instruct');
