// Copies the Nayancode Workbench source from its open-source repository (a sibling checkout, ../nayancode) into
// this website, so both stay identical. The nayancode repository is the source of truth for analysis code.
// Usage: node scripts/sync-workbench.mjs [path-to-nayancode]
import { cpSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
const from = resolve(process.argv[2] ?? '../nayancode');
if (!existsSync(join(from, 'src/studios'))) { console.error(`No Nayancode checkout at ${from}`); process.exit(1); }
const dirs = ['src/studios', 'src/ui', 'src/pages', 'src/compute', 'src/viz', 'src/styles', 'public/wasm', 'public/rdkit', 'public/data', 'benchmarks' /* reference values the unit tests compare against */];
for (const d of dirs) cpSync(join(from, d), d, { recursive: true });
// src/core: everything except the website's own brand file.
cpSync(join(from, 'src/core'), 'src/core', { recursive: true, filter: (p) => !p.endsWith('/brand.ts') });
console.log(`synced ${dirs.length + 1} folders from ${from}`);
