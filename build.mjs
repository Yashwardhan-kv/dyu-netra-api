// Dyunetra build: assembles pages, minifies HTML/CSS/JS (esbuild), writes dist/ for VistaPanel upload.
// Usage: NODE_PATH=/opt/npm-tools/node_modules node build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const esbuild = require('esbuild');

/* ---------------- CONFIG: edit these ---------------- */
const CONFIG = {
  SITE_URL: process.env.SITE_URL || '',            // e.g. https://www.yourdomain.com  (no trailing slash)
  EMAIL:    process.env.SITE_EMAIL || 'info@your-domain.com',
};
/* ---------------------------------------------------- */

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, 'src'), dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const rd = (p) => fs.readFileSync(p, 'utf8');
const head = rd(path.join(src, 'partials/head.html'));
const header = rd(path.join(src, 'partials/header.html'));
const footer = rd(path.join(src, 'partials/footer.html'));

function minHtml(h) {
  return h
    .replace(/<!--(?!\[)[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n/g, '')
    .trim();
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

for (const f of fs.readdirSync(path.join(src, 'pages')).filter((x) => x.endsWith('.html'))) {
  let page = rd(path.join(src, 'pages', f));
  const m = page.match(/^<!--meta:\s*(.*?)\s*-->/);
  const [title, brandTail, desc, scene, nav] = (m ? m[1] : 'Dyunetra | | | page | none').split('|').map((s) => s.trim());
  // Home: "Dyunetra | Cybersecurity, Blockchain & AI | desc..." ; others: "Page | Dyunetra | desc"
  const fullTitle = f === 'index.html' ? `${title} — ${brandTail}` : `${title} — ${brandTail}`;
  page = page.replace(/^<!--meta:.*?-->\s*/, '');
  const url = CONFIG.SITE_URL;
  let h = head
    .replace(/{{title}}/g, esc(fullTitle))
    .replace(/{{desc}}/g, esc(desc))
    .replace(/{{scene}}/g, scene)
    .replace('{{og}}', url ? `${url}/assets/img/og-image.jpg` : 'assets/img/og-image.jpg')
    .replace('{{canonical}}', url ? `<link rel="canonical" href="${url}/${f === 'index.html' ? '' : f}"><meta property="og:url" content="${url}/${f === 'index.html' ? '' : f}">` : '');
  let hd = header.replace(new RegExp(`(data-nav="${nav}")`), '$1 class="active" aria-current="page"');
  let out = (h + hd + page + footer).replace(/{{EMAIL}}/g, CONFIG.EMAIL);
  if (f === '404.html') out = out.replace(/(href|src)="(assets\/)/g, '$1="/$2').replace(/href="(index|contact)\.html"/g, 'href="/$1.html"');
  fs.writeFileSync(path.join(dist, f), minHtml(out));
}

// assets: images copied; css/js minified (no source maps, no comments)
fs.mkdirSync(path.join(dist, 'assets/css'), { recursive: true });
fs.mkdirSync(path.join(dist, 'assets/js'), { recursive: true });
fs.cpSync(path.join(src, 'assets/img'), path.join(dist, 'assets/img'), { recursive: true });
esbuild.buildSync({ entryPoints: [path.join(src, 'assets/css/style.css')], outfile: path.join(dist, 'assets/css/style.css'), minify: true, legalComments: 'none' });
esbuild.buildSync({ entryPoints: [path.join(src, 'assets/css/chatbot.css')], outfile: path.join(dist, 'assets/css/chatbot.css'), minify: true, legalComments: 'none' });
for (const j of ['scene', 'main', 'protect', 'blog-api', 'blog-loader', 'post-api', 'chatbot']) {
  esbuild.buildSync({
    entryPoints: [path.join(src, `assets/js/${j}.js`)], outfile: path.join(dist, `assets/js/${j}.js`),
    minify: true, legalComments: 'none', sourcemap: false, target: 'es2017', charset: 'ascii',
    mangleProps: undefined,
  });
}

// optional extra obfuscation if javascript-obfuscator is installed locally
try {
  const JO = require('javascript-obfuscator');
  for (const j of ['scene', 'main', 'protect', 'blog-api', 'blog-loader', 'post-api', 'chatbot']) {
    const p = path.join(dist, `assets/js/${j}.js`);
    fs.writeFileSync(p, JO.obfuscate(rd(p), { compact: true, stringArray: true, stringArrayEncoding: ['base64'], stringArrayThreshold: 0.75, splitStrings: true, splitStringsChunkLength: 6, identifierNamesGenerator: 'hexadecimal', selfDefending: false, controlFlowFlattening: false }).getObfuscatedCode());
  }
  console.log('Obfuscation: javascript-obfuscator applied.');
} catch { console.log('Obfuscation: esbuild minify/mangle only (install javascript-obfuscator for stronger).'); }

// server files
fs.writeFileSync(path.join(dist, 'contact.php'), rd(path.join(src, 'server/contact.php')).replace(/{{EMAIL}}/g, CONFIG.EMAIL));
fs.copyFileSync(path.join(src, 'server/htaccess.txt'), path.join(dist, '.htaccess'));
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /_private/\nDisallow: /contact.php\n${CONFIG.SITE_URL ? `Sitemap: ${CONFIG.SITE_URL}/sitemap.xml\n` : ''}`);
if (CONFIG.SITE_URL) {
  const pages = ['', 'about.html', 'services.html', 'blog.html', 'contact.html', 'whitepaper.html', 'credibility.html', 'terms.html', 'privacy.html'];
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((p) => `<url><loc>${CONFIG.SITE_URL}/${p}</loc></url>`).join('')}</urlset>`);
}

if (CONFIG.EMAIL.includes('your-domain')) console.warn('\n!! Set your real email: SITE_EMAIL=you@domain.com node build.mjs');
if (!CONFIG.SITE_URL) console.warn('!! Set SITE_URL=https://yourdomain.com to add canonical URLs, social previews and a sitemap.');
console.log('Built to', dist);

