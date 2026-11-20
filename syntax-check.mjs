import { execSync } from 'node:child_process';

// syntax check via esbuild bundled with wrangler? Just node --check on non-module script:
try {
  execSync('npx esbuild src/assets/js/main.js --bundle --outfile=/dev/null --external:* 2>&1', { encoding: 'utf8', shell: true, timeout: 30000 });
  console.log('syntax ok');
} catch (e) {
  console.log('ERR:', (e.stdout || e.message).slice(0, 500));
}
