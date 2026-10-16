import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** Regenerates src/site/data/site-index.json when content files change during development. */
function siteIndex() {
  let t: ReturnType<typeof setTimeout> | undefined;
  return {
    name: 'solagene-site-index',
    configureServer(server: { watcher: { on: (e: string, f: (p: string) => void) => void } }) {
      server.watcher.on('change', (p: string) => {
        if (!/src[\\/]site[\\/](data|articles)[\\/]/.test(p) || p.endsWith('site-index.json')) return;
        clearTimeout(t); t = setTimeout(() => spawn(process.execPath, ['scripts/site-index.mjs'], { stdio: 'inherit' }), 300);
      });
    },
  };
}

// Clean URLs (BrowserRouter) with every public page prerendered to static HTML (scripts/prerender.mjs).
// Serve from a domain root (Cloudflare Pages, Netlify, GitHub Pages with a custom domain); set BASE_PATH for a sub-path.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), siteIndex()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  worker: { format: 'es' },
  // Editors and scripts that rewrite a file by truncate-then-write can make the watcher see an empty file and cache it,
  // which later surfaces as "Failed to fetch dynamically imported module". Wait until the write has settled.
  // PORT lets the preview tool assign a free port; plain `npm run dev` still defaults to 5173.
  server: { port: Number(process.env.PORT) || 5173, watch: { awaitWriteFinish: { stabilityThreshold: 120, pollInterval: 20 } } },
  // Pre-bundle everything that lazy studios import, so the dev server never re-optimises mid-session
  // (that re-optimisation is what produces "Failed to fetch dynamically imported module").
  optimizeDeps: {
    entries: ['index.html', 'src/studios/**/*.tsx'],
    include: [
      'react', 'react-dom/client', 'react-router-dom', 'zustand', 'motion/react',
      'molstar/lib/mol-plugin-ui', 'molstar/lib/mol-plugin-ui/react18', 'molstar/lib/mol-plugin-ui/spec', 'molstar/lib/mol-util/color', 'molstar/lib/mol-script/script', 'molstar/lib/mol-model/structure',
    ],
  },
  // The manifest lets the prerenderer add <link rel=modulepreload> for each page's own chunks (no request waterfall).
  build: { target: 'es2022', chunkSizeWarningLimit: 1500, manifest: true },
  // GitHub's CI runners are slower than a laptop; a generous timeout keeps compute-heavy kernel tests from flaking.
  test: { environment: 'node', include: ['src/**/*.test.ts'], testTimeout: 20_000 },
});
