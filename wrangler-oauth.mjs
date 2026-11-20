// Deploy via wrangler with OAuth login (browser pops up for user approval)
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';

const PROJ = 'dyunetra';

// run wrangler pages deploy in foreground so the OAuth browser popup appears for the user
// spawn instead so browser can open and we keep streaming output
const child = spawn('npx', ['wrangler', 'pages', 'project', 'create', PROJ, '--production-branch=main'], {
  shell: true, stdio: 'inherit', env: { ...process.env }
});
child.on('exit', code => {
  console.log('project create exit', code);
});
