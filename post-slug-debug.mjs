export default async function run(page, ui) {
  await page.goto('http://localhost:8787/post.html?slug=pipeline-test-001', { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  return await page.evaluate(() => ({
    search: location.search,
    slugParam: new URLSearchParams(location.search).get('slug'),
    postApiLoaded: !!document.querySelector('script[src*="post-api"]'),
    loaderLoaded: !!document.querySelector('script[src*="blog-loader"]'),
    bodyEl: !!document.getElementById('post-body')
  }));
}
