import fs from 'node:fs';
for (const page of ['index.html', 'about.html']) {
  const html = fs.readFileSync('C:/Brand/dyunetra-website-source/dist/' + page, 'utf8');
  const j = html.indexOf('dyu-bot');
  console.log(page, '| dyu-bot found at:', j, '| snippet:', j > -1 ? html.slice(j, j + 120) : '(widget built client-side via JS — expected)');
}
