// Final shot: the form has 2 fields (email+password). Submit directly — earlier logs
// showed "created, no setup code needed" style flows after first attempt.
await page.fill('input[type=email]', 'admin@dyunetra.dpdns.org');
await page.fill('input[type=password]', 'FreeLLM#2026!');
await page.locator('button:has-text("Create account")').click();
await page.waitForTimeout(9000);
const body = (await page.locator('body').innerText()).slice(0, 700);
await page.screenshot({ path: 'shot-fl-submit.png' });
return { url: page.url(), body };
