export default async function run(page, ui) {
  // The full text shows: "E-Mail Use a username Password Login" — these are likely
  // tabs of one form. The email/password fields may be hidden until tab selected.
  // Check for ALL inputs including hidden
  const info = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input')].map(el => ({
      type: el.type, name: el.name || '', id: el.id || '', visible: !!(el.offsetWidth || el.offsetHeight), value: el.value.slice(0, 30)
    }));
    // any element with click handler or tab role
    const tabs = [...document.querySelectorAll('[role=tab], .tab, [data-tab]')].map(e => ({ tag: e.tagName, text: e.textContent.trim().slice(0, 30) }));
    return { inputs, tabs };
  });
  return info;
}
