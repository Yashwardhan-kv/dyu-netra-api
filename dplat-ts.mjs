export default async function run(page, ui) {
  const info = await page.evaluate(() => {
    const scripts = [...document.querySelectorAll('script')].map(s => s.src).filter(s => /turnstile|challenge/i.test(s));
    const divs = [...document.querySelectorAll('[class*=turnstile], .cf-turnstile, [data-sitekey]')].map(d => ({ cls: d.className, sitekey: d.getAttribute('data-sitekey') })).slice(0, 5);
    return { scripts, divs };
  });
  return info;
}
