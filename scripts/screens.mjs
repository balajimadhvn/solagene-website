// Captures real screenshots of every Nayancode product from the running app (with its labelled demo data loaded)
// and writes them as WebP to public/img/products/. Usage: start the dev server (npm run dev) or a preview, then
//   node scripts/screens.mjs [baseUrl=http://localhost:5173] [only-slug]
// Screens are 1280×800 in the Workbench's dark theme. Steps mirror e2e/studios.spec.ts.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'img', 'products');
mkdirSync(out, { recursive: true });
const base = process.argv[2] ?? 'http://localhost:5173';
const only = process.argv[3];

const click = async (page, role, name, opts = {}) => { const el = page.getByRole(role, { name }).first(); await el.waitFor({ state: 'visible', timeout: opts.timeout ?? 20_000 }); await el.click(); };
const seen = async (page, text, timeout = 60_000) => page.getByText(text).first().waitFor({ state: 'visible', timeout }).catch(() => console.warn(`  (did not see ${text})`));

const SHOTS = [
  ['workbench', '/workbench', async () => {}],
  ['sequence-studio', '/sequence', async (p) => { await click(p, 'button', 'Demo DNA'); await p.waitForTimeout(800); const t = p.getByRole('tab', { name: /Digest|Restriction/ }).first(); if (await t.count()) { await t.click(); await p.waitForTimeout(600); const r = p.getByRole('button', { name: /Digest|Run/ }).first(); if (await r.count()) await r.click().catch(() => {}); } await p.waitForTimeout(1200); }],
  ['genome-studio', '/genome', async (p) => { await click(p, 'tab', 'Mapping & variants'); await click(p, 'button', /Demo: simulated/); await click(p, 'button', 'Map & call'); await seen(p, /planted variants recovered/, 90_000); await p.waitForTimeout(1500); }],
  ['variant-studio', '/variants', async (p) => { await click(p, 'button', /Demo: synthetic tumor/); await p.waitForTimeout(2500); }],
  ['expression-studio', '/expression', async (p) => { await click(p, 'button', /Load real-gene demo/); await click(p, 'button', 'Run analysis'); await seen(p, 'Genes tested'); await p.waitForTimeout(1500); }],
  ['single-cell-studio', '/single-cell', async (p) => { await click(p, 'button', /Run synthetic PBMC-like demo/); await seen(p, 'Cells kept', 90_000); await p.waitForTimeout(2000); }],
  ['microbiome-studio', '/microbiome', async (p) => { await click(p, 'button', /Load synthetic demo/); await click(p, 'button', 'Run analysis'); await seen(p, /p = /); await p.waitForTimeout(1500); }],
  ['chemistry-studio', '/chemistry', async (p) => { await click(p, 'button', /Load example/, { timeout: 60_000 }); await p.locator('.mol-card').first().waitFor({ timeout: 30_000 }).catch(() => {}); await p.waitForTimeout(1500); }],
  ['structure-studio', '/structure', async (p) => { await click(p, 'button', 'Load structure', { timeout: 60_000 }); await seen(p, /Structure analysis/, 60_000); await click(p, 'button', 'Profile interactions').catch(() => {}); await p.waitForTimeout(4000); }],
  ['phylogenetics-studio', '/phylogenetics', async (p) => { await click(p, 'button', /Demo: 12-protein family/); await click(p, 'button', 'Run progressive alignment'); await p.waitForTimeout(2500); await click(p, 'button', 'Build tree').catch(() => {}); await p.waitForTimeout(3000); }],
  ['docking-studio', '/docking', async (p) => { await click(p, 'button', /Demo: HIV protease/); await seen(p, /1HSG \(bundled copy\)/); await p.locator('label.field', { hasText: 'Exhaustiveness' }).locator('input[type=range]').fill('1'); await click(p, 'button', 'Dock'); await seen(p, 'Top pose < 2 Å from crystal', 6 * 60_000); await p.waitForTimeout(2500); }],
  ['lab-studio', '/lab', async (p) => { await click(p, 'tab', 'Dose–response'); await click(p, 'button', /Load demo/); await click(p, 'button', 'Fit curves'); await seen(p, 'Cmpd A'); await p.waitForTimeout(1500); }],
  ['gene-atlas', '/atlas', async (p) => { const i = p.locator('input.input').first(); await i.fill('TP53'); await click(p, 'button', 'Look up'); await p.getByText(/Disease associations/).first().waitFor({ timeout: 45_000 }).catch(() => {}); await p.waitForTimeout(2500); }],
  ['report-builder', '/expression', async (p) => { await click(p, 'button', /Load synthetic demo/); await click(p, 'button', 'Run analysis'); await seen(p, 'Genes tested'); await p.getByLabel('Add figure to report').first().click().catch(() => {}); await p.waitForTimeout(800); await p.getByRole('link', { name: 'Report' }).first().click(); await p.waitForTimeout(2500); }],
  ['nf-core-import', '/import', async () => {}],
];

const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, colorScheme: 'dark' });
await ctx.addInitScript(() => { try { localStorage.setItem('wb.theme', 'dark'); } catch { /* ignore */ } });
for (const [slug, route, steps] of SHOTS) {
  if (only && slug !== only) continue;
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.accept());
  try {
    await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForTimeout(800);
    await steps(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    const png = await page.screenshot({ type: 'png' });
    const webp = await page.evaluate(async (b64) => {
      const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', 0.86).split(',')[1];
    }, png.toString('base64'));
    writeFileSync(join(out, `${slug}.webp`), Buffer.from(webp, 'base64'));
    console.log(`✓ ${slug}`);
  } catch (e) { console.warn(`✗ ${slug}: ${e.message.split('\n')[0]}`); }
  await page.close();
}
await browser.close();
