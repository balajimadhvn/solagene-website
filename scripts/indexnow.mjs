// Tells Bing, Yandex and other IndexNow engines which URLs exist or changed. Run after a deploy:
//   node scripts/indexnow.mjs            submits every URL in the live sitemap
//   node scripts/indexnow.mjs URL ...    submits just those URLs
// The key file is public/cb9792a9427d507d65125b3a8586e616.txt (served at the site root). Google does not use IndexNow; use Search Console for it.
const KEY = 'cb9792a9427d507d65125b3a8586e616';
const HOST = 'solagene.com';
let urls = process.argv.slice(2);
if (!urls.length) {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${urls.length} URLs, HTTP ${res.status} (200/202 = accepted)`);
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
