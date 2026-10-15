// Generates the share images (public/og.png, og-vedicgen.png, og-nayancode.png, 1200×630) and logo PNGs
// (public/brand/vivofold-logo-512.png, -192.png, apple-touch-icon.png, favicon-32.png) from the brand files.
// Re-run after changing the logo, company name or taglines:  npm run og
// Fonts are read from the installed @fontsource packages, so no network access is needed.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brand = readFileSync(join(root, 'src/core/brand.ts'), 'utf8');
const get = (k, from = brand) => (from.match(new RegExp(`\\b${k}: '([^']*)'`)) ?? [])[1] ?? '';
const name = get('name'), tagline = get('tagline'), site = get('siteUrl').replace(/^https?:\/\//, '');
const div = (id) => brand.slice(brand.indexOf(`${id}: {`));
const vg = { tagline: get('tagline', div('vedicgen')) }, nc = { tagline: get('tagline', div('nayancode')) };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const font = (p) => `data:font/woff2;base64,${readFileSync(join(root, 'node_modules', p)).toString('base64')}`;
const jak = font('@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2');
const plex = font('@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2');
const mark = `data:image/svg+xml;base64,${readFileSync(join(root, 'public/brand/vivofold-mark.svg')).toString('base64')}`;
const word = readFileSync(join(root, 'src/site/wordmark.ts'), 'utf8');
const W = { w: +(word.match(/w: (\d+)/) ?? [])[1], h: +(word.match(/h: (\d+)/) ?? [])[1], d: (word.match(/d: '([^']+)'/) ?? [])[1] };
const wordSvg = (h, fill) => `<svg viewBox="0 -${W.h} ${W.w} ${W.h}" height="${h}" width="${Math.round((h * W.w) / W.h)}"><path d="${W.d}" fill="${fill}"/></svg>`;

const css = `@font-face { font-family: J; src: url(${jak}) format('woff2'); font-weight: 200 800; }
@font-face { font-family: P; src: url(${plex}) format('woff2'); font-weight: 100 700; }
* { box-sizing: border-box; margin: 0; } body { width: 1200px; height: 630px; overflow: hidden; position: relative; font-family: P, sans-serif; color: #edf1fb; word-spacing: 0.06em; }`;

function og({ kicker, title, sub, glowA, glowB, accent, chip }) {
  return `<!doctype html><html><head><style>${css}
body { background: radial-gradient(700px 420px at 88% 18%, ${glowA}, transparent 60%), radial-gradient(640px 400px at 0% 100%, ${glowB}, transparent 60%), linear-gradient(180deg, #071027, #0a1638); }
.grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px); background-size: 48px 48px; mask-image: radial-gradient(ellipse at 70% 40%, #000 20%, transparent 70%); }
.top { position: absolute; left: 80px; top: 70px; display: flex; align-items: center; gap: 18px; }
.chip { margin-left: 8px; padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.2); font: 700 20px J; color: ${accent}; }
.k { position: absolute; left: 80px; top: 196px; font: 700 20px J; letter-spacing: 0.16em; text-transform: uppercase; color: ${accent}; }
h1 { position: absolute; left: 80px; top: 236px; width: 720px; font: 800 74px/1.04 J; letter-spacing: -0.03em; }
p.s { position: absolute; left: 80px; top: 420px; width: 700px; font: 400 26px/1.4 P; color: #c3cce4; }
.f { position: absolute; left: 80px; bottom: 60px; font: 600 22px J; color: #93a0bf; letter-spacing: 0.04em; }
.m { position: absolute; right: 70px; top: 140px; width: 340px; height: 350px; background: url(${mark}) center / contain no-repeat; filter: drop-shadow(0 30px 60px rgba(0,0,0,0.5)); }
.bar { position: absolute; left: 0; right: 0; bottom: 0; height: 8px; background: linear-gradient(90deg, #1f6fe0, #6a55d4 52%, #2cb5a0); }
</style></head><body><div class="grid"></div>
<div class="top">${wordSvg(30, '#ffffff')}${chip ? `<span class="chip">${esc(chip)}</span>` : ''}</div>
<div class="k">${esc(kicker)}</div><h1>${esc(title)}</h1><p class="s">${esc(sub)}</p><div class="f">${esc(site)}</div><div class="m"></div><div class="bar"></div></body></html>`;
}

const SHOTS = [
  ['og.png', og({ kicker: 'Biotechnology · Bioinformatics · Software', title: tagline, sub: 'Research, education and scientific software for the life sciences: Vedicgen courses, Nayancode software and research services.', glowA: 'rgba(106,85,212,0.55)', glowB: 'rgba(44,181,160,0.35)', accent: '#7fe3c4' })],
  ['og-vedicgen.png', og({ kicker: 'Wet-lab · Dry-lab · Internships', title: vg.tagline, sub: 'Courses, programmes, internships and research training in biotechnology, bioinformatics and the life sciences.', glowA: 'rgba(44,181,160,0.55)', glowB: 'rgba(31,111,224,0.4)', accent: '#7fe3c4', chip: 'Vedicgen' })],
  ['og-nayancode.png', og({ kicker: 'Scientific software', title: nc.tagline, sub: 'Bioinformatics studios that run privately in your browser: genomics, RNA-seq, single-cell, chemistry and structure.', glowA: 'rgba(106,85,212,0.7)', glowB: 'rgba(31,111,224,0.4)', accent: '#b3a6ff', chip: 'Nayancode' })],
];
const icon = (size, bg) => `<!doctype html><html><head><style>* { margin: 0; } body { width: ${size}px; height: ${size}px; display: grid; place-items: center; background: ${bg}; } i { display: block; width: ${Math.round(size * 0.74)}px; height: ${Math.round(size * 0.76)}px; background: url(${mark}) center / contain no-repeat; }</style></head><body><i></i></body></html>`;
const ICONS = [['brand/vivofold-logo-512.png', 512, '#ffffff'], ['brand/vivofold-logo-192.png', 192, '#ffffff'], ['brand/apple-touch-icon.png', 180, '#ffffff'], ['brand/favicon-32.png', 32, 'transparent'], ['brand/favicon-16.png', 16, 'transparent'],
  // Google Search shows the site favicon only if it is square and at least 48 px (multiples of 48 preferred).
  ['brand/favicon-48.png', 48, '#ffffff'], ['brand/favicon-96.png', 96, '#ffffff'], ['brand/favicon-192.png', 192, '#ffffff']];

const browser = await chromium.launch({ args: ['--no-sandbox'] });
for (const [file, html] of SHOTS) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200);
  await page.screenshot({ path: join(root, 'public', file) }); await page.close(); console.log(`wrote public/${file}`);
}
for (const [file, size, bg] of ICONS) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(icon(size, bg), { waitUntil: 'load' }); await page.waitForTimeout(100);
  await page.screenshot({ path: join(root, 'public', file), omitBackground: bg === 'transparent' }); await page.close(); console.log(`wrote public/${file}`);
}
await browser.close();

// /favicon.ico (16, 32, 48 px PNG frames): crawlers and old browsers request it at the site root.
const frames = ['brand/favicon-16.png', 'brand/favicon-32.png', 'brand/favicon-48.png'].map((f) => readFileSync(join(root, 'public', f)));
const head = Buffer.alloc(6 + 16 * frames.length); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(frames.length, 4);
let offset = head.length;
frames.forEach((png, i) => { const size = png.readUInt32BE(16), e = 6 + 16 * i; head.writeUInt8(size % 256, e); head.writeUInt8(size % 256, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6); head.writeUInt32LE(png.length, e + 8); head.writeUInt32LE(offset, e + 12); offset += png.length; });
writeFileSync(join(root, 'public', 'favicon.ico'), Buffer.concat([head, ...frames])); console.log('wrote public/favicon.ico');
