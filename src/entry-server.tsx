import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { Routes, StaticRouter } from 'react-router-dom';
import * as PAGES from '@/site/pages.eager';
import { siteRoutes } from '@/site/routes';
export { appRoutes, headHtml, legacyRedirects, metaFor, siteRoutes as routeList } from '@/site/seo';
export { BRAND, INTEGRATIONS, launchChecklist } from '@/core/brand';

/** Build-time render of a public page (see scripts/prerender.mjs). Must mirror the tree in App.tsx. */
export function render(url: string) {
  // With BASE_PATH (e.g. https://<account>.github.io/<repo>/) links must carry the sub-path in the static HTML too.
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '');
  return renderToString(<StrictMode><StaticRouter basename={basename || undefined} location={basename + url}><Routes>{siteRoutes(PAGES)}</Routes></StaticRouter></StrictMode>);
}
