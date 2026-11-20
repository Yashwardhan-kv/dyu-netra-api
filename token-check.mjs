export default async function run(page, ui) {
  await page.screenshot({ path: 'shot-token.png' });
  const token = await page.evaluate(() => {
    const t = document.querySelector('input[name="cf-turnstile-response"]');
    return t && t.value ? 'TOKEN PRESENT' : 'EMPTY';
  });
  return { token, url: page.url().slice(-60), body: (await page.locator('body').innerText()).slice(0, 200) };
}
