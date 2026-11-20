export default async function run(page, ui) {
  // Fresh navigation to clear hung turnstile
  await page.goto('https://dashboard.digitalplat.org/auth/login', { waitUntil: 'networkidle', timeout: 45000 }).catch(e => console.error('nav:', e.message));
  await page.waitForTimeout(6000);
  const state = await page.evaluate(() => {
    const t = document.querySelector('input[name="cf-turnstile-response"]');
    const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Login');
    return {
      tsLoaded: !!window.turnstile,
      token: t ? !!t.value : null,
      frames: [...document.querySelectorAll('iframe')].map(f => f.src.slice(0, 80)),
      loginDisabled: btn ? btn.disabled : null
    };
  });
  return state;
}
