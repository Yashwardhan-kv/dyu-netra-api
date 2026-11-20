export default async function run(page, ui) {
  await ui.fill('@e1', 'alalr_43402952');
  await ui.fill('@e2', 'GkvD9zBcyAG9j89POYlvuT0RRqzh');
  await ui.click('@e4');
  await page.waitForTimeout(9000);
  return { url: page.url(), title: await page.title(), body: (await page.locator('body').innerText()).slice(0, 700) };
}
