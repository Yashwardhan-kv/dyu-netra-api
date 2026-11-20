export default async function run(page, ui) {
  await ui.fill('@e1', 'dyunetra@gmail.com');
  await ui.fill('@e2', 'Developer@123');
  await ui.click('@e4');
  await page.waitForTimeout(6000);
  return { url: page.url(), title: await page.title() };
}
