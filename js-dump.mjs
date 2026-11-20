export default async function run(page, ui) {
  const deployed = await page.evaluate(async () => {
    const t = await (await fetch('https://dyunetra.dpdns.org/assets/js/chatbot.js?v=' + Date.now())).text();
    const i = t.indexOf('fab.addEventListener');
    return t.slice(i, i + 900);
  });
  console.log(deployed);
  return { done: true };
}
