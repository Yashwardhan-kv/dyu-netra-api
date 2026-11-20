// Dashboard requires 3 fields (email, password, setup code) but page shows only 2
// visible inputs. The 403 means the code wasn't sent. Look for a "Add setup code" /
// expand link, or the code field may be off-screen. Dump input inventory:
export default async function run(page, ui) {
  const inputs = await page.evaluate(() => [...document.querySelectorAll('input')].map(el => ({
    type: el.type, name: el.name || '', placeholder: el.placeholder || '', visible: !!(el.offsetWidth || el.offsetHeight), id: el.id
  })));
  const buttons = await page.evaluate(() => [...document.querySelectorAll('button')].map(b => b.textContent.trim().slice(0, 40)));
  return { inputs, buttons };
}
