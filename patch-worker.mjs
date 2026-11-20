// Patch: worker error message to include the upstream base (debugging)
import fs from 'node:fs';
const p = 'C:\\Brand\\dyunetra-website-source\\chatbot\\worker.js';
let w = fs.readFileSync(p, 'utf8');
if (!w.includes('Assistant is not configured yet (')) {
  w = w.replace(
    "return { error: 'Assistant is not configured yet. Please use the Contact page.', status: 503 };",
    "return { error: 'Assistant upstream: ' + (base || '(empty)').slice(0, 50), status: 503 };"
  );
  fs.writeFileSync(p, w);
  console.log('patched');
} else console.log('already patched');
