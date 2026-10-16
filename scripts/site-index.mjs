// Generates src/site/data/site-index.json from the full content modules (see src/site/data/index-source.ts).
// Runs automatically before `npm run dev` and `npm run build`, and on data changes during development.
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = mkdtempSync(join(tmpdir(), 'solagene-index-'));
await build({ root, configFile: false, logLevel: 'error', resolve: { alias: { '@': join(root, 'src') } }, build: { ssr: join(root, 'src/site/data/index-source.ts'), outDir: out, emptyOutDir: true, rollupOptions: { output: { entryFileNames: 'index.mjs' } } } });
const { buildIndex } = await import(pathToFileURL(join(out, 'index.mjs')).href);
const index = buildIndex();
writeFileSync(join(root, 'src/site/data/site-index.json'), JSON.stringify(index));
rmSync(out, { recursive: true, force: true });
console.log(`site-index: ${index.courses.length} courses, ${index.products.length} products, ${index.services.length} services, ${index.internships.length} internships, ${index.articles.length} articles, ${index.tools.length} tools`);
