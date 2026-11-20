export default async function run(page, ui) {
  // check turnstile token status
  const st = await page.evaluate(() => {
    const t = document.querySelector('input[name="cf-turnstile-response"]');
    return { hasToken: !!(t && t.value), frames: [...document.querySelectorAll('iframe')].map(f => f.src.slice(0, 60)) };
  });
  // scroll Login into view & click with force
  const btn = page.locator('button', { hasText: /^Login$/ }).last();
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await btn.click({ force: true, timeout: 5000 }).catch(e => { });
  await page.waitForTimeout(8000);
  const url = page.url();
  return { st, urlAfter: url.slice(-50), body: (await page.locator('body').innerText()).slice(0, 300) };
}
