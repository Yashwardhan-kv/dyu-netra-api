export default async function run(page, ui) {
  return await page.evaluate(() => {
    const t = document.querySelector('input[name="cf-turnstile-response"]');
    const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Login');
    return {
      token: t ? (t.value ? t.value.slice(0, 20) + '...' : '(empty)') : null,
      frames: [...document.querySelectorAll('iframe')].map(f => f.src.slice(0, 80)),
      loginDisabled: btn ? btn.disabled : null
    };
  });
}
