// Build step: render every public route to static HTML (with its own <head>), plus 404.html, redirect pages for old
// URLs, sitemap.xml and robots.txt. Runs after `vite build` (client) and `vite build --ssr` (server entry).
// Output layout suits GitHub Pages (and any static host): /path/ is served from path/index.html with no redirect,
// and canonical URLs, the sitemap and internal links all use the trailing-slash form.
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssr = await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href);
const { render, metaFor, headHtml, routeList, appRoutes, legacyRedirects, BRAND, INTEGRATIONS, launchChecklist } = ssr;

const template = readFileSync(join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--app-->') || !/<!--head-->[\s\S]*<!--\/head-->/.test(template)) throw new Error('index.html is missing the <!--head--> / <!--app--> markers');
const analytics = INTEGRATIONS.cloudflareAnalyticsToken
  ? `\n    <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: INTEGRATIONS.cloudflareAnalyticsToken })}'></script>`
  : '';

// Preload hints: each page's own JS chunks (from Vite's manifest) and the fonts used above the fold.
const base = process.env.BASE_PATH || '/';
const manifestFile = join(dist, '.vite', 'manifest.json');
const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : {};
const PAGE_SRC = [
  [/^\/$/, 'Home'], [/^\/(about|contact)$/, 'Company'], [/^\/(verify|privacy|terms|refund-policy)$/, 'Legal'], [/^\/research/, 'Research'], [/^\/services/, 'Services'], [/^\/learn/, 'Learn'],
  [/^\/vedicgen$/, 'vedicgen/Home'], [/^\/vedicgen\/courses$/, 'vedicgen/Catalogue'], [/^\/vedicgen\/courses\/./, 'vedicgen/CourseDetail'], [/^\/vedicgen\/programs/, 'vedicgen/Programs'], [/^\/vedicgen\/internships/, 'vedicgen/Internships'],
  [/^\/vedicgen\/(workshops|research-training|institutions)$/, 'vedicgen/Training'], [/^\/vedicgen\/(pricing|apply)$/, 'vedicgen/Admissions'],
  [/^\/nayancode$/, 'nayancode/Home'], [/^\/nayancode\/products/, 'nayancode/Products'], [/^\/nayancode\/tools/, 'nayancode/Tools'], [/^\/nayancode\/(docs|pricing|demo)$/, 'nayancode/Support'],
];
const entryImports = new Set();
const collect = (key, out) => { const m = manifest[key]; if (!m || out.has(m.file)) return; out.add(m.file); for (const k of m.imports ?? []) collect(k, out); };
const entryKey = Object.keys(manifest).find((k) => manifest[k].isEntry);
if (entryKey) collect(entryKey, entryImports);
const fonts = readdirSync(join(dist, 'assets')).filter((f) => /^ibm-plex-sans-latin-wght-normal-.*\.woff2$/.test(f));
const fontLinks = fonts.map((f) => `<link rel="preload" href="${base}assets/${f}" as="font" type="font/woff2" crossorigin />`).join('\n    ');
function preloads(route) {
  const hit = PAGE_SRC.find(([re]) => re.test(route));
  const files = new Set();
  if (hit) collect(`src/site/pages/${hit[1]}.tsx`, files);
  return [...files].filter((f) => !entryImports.has(f) && f.endsWith('.js')).map((f) => `<link rel="modulepreload" href="${base}${f}" />`).join('\n    ');
}
const page = (head, body, path = '') => template.replace(/<!--head-->[\s\S]*<!--\/head-->/, head + analytics + (fontLinks ? `\n    ${fontLinks}` : '') + (path && path !== '*' ? `\n    ${preloads(path)}` : '')).replace('<div id="root"><!--app--></div>', `<div id="root"${path ? ` data-ssr="${path}"` : ''}>${body}</div>`);
const fileFor = (route) => (route === '/' ? join(dist, 'index.html') : join(dist, route.replace(/^\//, ''), 'index.html'));
const write = (route, html) => { const file = fileFor(route); mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, html); };

let n = 0;
for (const route of routeList()) {
  const meta = metaFor(route);
  if (!meta) throw new Error(`No metadata for ${route}`);
  const body = render(route);
  if (!body.includes('<h1')) throw new Error(`${route} rendered without an <h1>`);
  if (/Being rebuilt/.test(body)) throw new Error(`${route} is still a placeholder`);
  write(route, page(headHtml(meta), body, route));
  n++;
}
for (const route of appRoutes()) { const meta = metaFor(route); write(route, page(headHtml(meta), '')); n++; }

// Old URLs → new URLs: a tiny page with a canonical link, an instant meta refresh and a script fallback.
let r = 0;
for (const [from, to] of legacyRedirects()) {
  if (existsSync(fileFor(from))) continue;
  const url = `${BRAND.siteUrl}${to}/`;
  write(from, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved: ${BRAND.name}</title><link rel="canonical" href="${url}"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${base}${to.replace(/^\//, '')}/"><script>location.replace('${base}${to.replace(/^\//, '')}/' + location.search + location.hash)</script></head><body><p>This page has moved to <a href="${base}${to.replace(/^\//, '')}/">${url}</a>.</p></body></html>`);
  r++;
}

// Real 404 page (GitHub Pages, Cloudflare Pages and Netlify serve it with status 404).
const nf = { path: '/404', title: 'Page not found', description: BRAND.description, type: 'website', noindex: true, jsonLd: [] };
writeFileSync(join(dist, '404.html'), page(headHtml(nf).replace(/<link rel="canonical"[^>]*>\n\s*/, ''), render('/this-page-does-not-exist'), '*'));

// lastmod is the date of the last commit that touched site content, not the build day: Google ignores lastmod
// once it is seen to change on every deploy. Falls back to today when git history is unavailable.
const today = (() => {
  try { return execSync('git log -1 --format=%cs -- src/site src/core/brand.ts public/brand', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || new Date().toISOString().slice(0, 10); } catch { return new Date().toISOString().slice(0, 10); }
})();
const loc = (route) => `${BRAND.siteUrl}${route === '/' ? '/' : `${route}/`}`;
const urls = routeList().map((rt) => { const m = metaFor(rt); return `  <url><loc>${loc(rt)}</loc><lastmod>${today}</lastmod><priority>${(m.priority ?? 0.5).toFixed(2)}</priority></url>`; });
urls.push(`  <url><loc>${loc('/workbench')}</loc><lastmod>${today}</lastmod><priority>0.70</priority></url>`);
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /report/\nDisallow: /import/\nDisallow: /licenses/\n\nSitemap: ${BRAND.siteUrl}/sitemap.xml\n`);

rmSync(join(root, 'dist-ssr'), { recursive: true, force: true });
rmSync(join(dist, '.vite'), { recursive: true, force: true }); // build manifest: only needed above, not deployed
console.log(`prerender: ${n} pages, ${r} redirects, 404.html, sitemap.xml (${urls.length} URLs), robots.txt`);
const todo = launchChecklist();
if (todo.length) console.warn(`\nLaunch checklist (src/core/brand.ts), ${todo.length} item${todo.length > 1 ? 's' : ''} still to personalise:\n${todo.map((t) => `  - ${t}`).join('\n')}\n`);
