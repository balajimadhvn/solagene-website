import '@fontsource-variable/ibm-plex-sans/wght.css';
import '@fontsource-variable/ibm-plex-sans/wght-italic.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './styles/tokens.css';
import './styles/global.css';
import './site/site.css';
import './site/solagene.css';
import './site/science.css';
import './site/refine.css';
import './core/ui-store';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { installChunkRecovery } from './core/chunk-recovery';

installChunkRecovery();

// Public pages are prerendered to static HTML at build time (as path/index.html, served at /path/). Hydrate only when
// the markup belongs to this URL. 404.html (marked "*") is served for every unknown URL, and the app may render that URL
// inside a section layout (e.g. /vedicgen/courses/<unknown>/), so it renders from scratch instead of hydrating, as do
// Workbench pages and hosts that serve a fallback page. Paths are compared without the trailing slash.
const bare = (p: string) => p.replace(/\/+$/, '') || '/';
const root = document.getElementById('root')!;
const app = <StrictMode><App /></StrictMode>;
const ssr = root.dataset.ssr;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const here = bare(location.pathname.slice(base.length) || '/');
if (ssr && ssr !== '*' && bare(ssr) === here) hydrateRoot(root, app);
else { root.textContent = ''; createRoot(root).render(app); }
(window as unknown as { __appReady: boolean }).__appReady = true;
