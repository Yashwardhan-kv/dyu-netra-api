export default async function run(page, ui) {
  const info = await page.evaluate(() => {
    const w = window.turnstile;
    const containers = [...document.querySelectorAll('div')].filter(d => d.querySelector('input[name="cf-turnstile-response"]') !== null).map(d => ({ cls: d.className.slice(0, 80), children: d.childElementCount, size: `${d.offsetWidth}x${d.offsetHeight}`, html: d.outerHTML.slice(0, 400) }));
    return { tsLoaded: !!w, tsMethods: w ? Object.keys(w) : null, containers };
  });
  return info;
}
