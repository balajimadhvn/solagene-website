// Browser: each public page group is its own chunk. The prerendered HTML stays on screen while a chunk loads, and
// later navigations keep the current page visible until the next one is ready (React Router uses transitions), so
// code-splitting never shows a blank page. Chunks are also prefetched when a visitor points at a link.
import type * as Eager from './pages.eager';
import { lazyRetry } from '@/core/lazy';

type Pages = { [K in keyof typeof Eager]: React.ComponentType };
const load = {
  Home: () => import('./pages/Home'),
  Company: () => import('./pages/Company'),
  Legal: () => import('./pages/Legal'),
  Research: () => import('./pages/Research'),
  Services: () => import('./pages/Services'),
  Learn: () => import('./pages/Learn'),
  Science: () => import('./pages/Science'),
  NotFound: () => import('./pages/NotFound'),
  VgHome: () => import('./pages/vedicgen/Home'),
  Catalogue: () => import('./pages/vedicgen/Catalogue'),
  CourseDetail: () => import('./pages/vedicgen/CourseDetail'),
  Programs: () => import('./pages/vedicgen/Programs'),
  Internships: () => import('./pages/vedicgen/Internships'),
  Training: () => import('./pages/vedicgen/Training'),
  Admissions: () => import('./pages/vedicgen/Admissions'),
  NcHome: () => import('./pages/nayancode/Home'),
  Products: () => import('./pages/nayancode/Products'),
  Tools: () => import('./pages/nayancode/Tools'),
  Support: () => import('./pages/nayancode/Support'),
};
const L = <M,>(f: () => Promise<M>, k: keyof M) => lazyRetry(() => f().then((m) => ({ default: m[k] as React.ComponentType })));

export const PAGES: Pages = {
  Home: L(load.Home, 'default'),
  About: L(load.Company, 'About'), Contact: L(load.Company, 'Contact'),
  Privacy: L(load.Legal, 'Privacy'), Terms: L(load.Legal, 'Terms'), Refunds: L(load.Legal, 'Refunds'), Verify: L(load.Legal, 'Verify'),
  ResearchHub: L(load.Research, 'ResearchHub'), ResearchArea: L(load.Research, 'ResearchArea'),
  ServicesHub: L(load.Services, 'ServicesHub'), ServiceDetail: L(load.Services, 'ServiceDetail'),
  LearnHub: L(load.Learn, 'LearnHub'), ArticlePage: L(load.Learn, 'ArticlePage'),
  Science: L(load.Science, 'Science'), Solutions: L(load.Science, 'Solutions'), Industry: L(load.Science, 'Industry'),
  NotFound: L(load.NotFound, 'default'),
  VedicgenHome: L(load.VgHome, 'default'),
  CourseCatalogue: L(load.Catalogue, 'default'),
  CourseDetail: L(load.CourseDetail, 'default'),
  ProgramsHub: L(load.Programs, 'ProgramsHub'), ProgramDetail: L(load.Programs, 'ProgramDetail'),
  InternshipsHub: L(load.Internships, 'InternshipsHub'), InternshipDetail: L(load.Internships, 'InternshipDetail'),
  Workshops: L(load.Training, 'Workshops'), ResearchTraining: L(load.Training, 'ResearchTraining'), Institutions: L(load.Training, 'Institutions'),
  Pricing: L(load.Admissions, 'Pricing'), Apply: L(load.Admissions, 'Apply'),
  NayancodeHome: L(load.NcHome, 'default'),
  ProductsHub: L(load.Products, 'ProductsHub'), ProductDetail: L(load.Products, 'ProductDetail'),
  ToolsHub: L(load.Tools, 'ToolsHub'), ToolPage: L(load.Tools, 'ToolPage'),
  Docs: L(load.Support, 'Docs'), Licensing: L(load.Support, 'Licensing'), Demo: L(load.Support, 'Demo'),
};

/** Route → chunk, used for prefetching on hover and for <link rel=modulepreload> in prerendered pages. */
export const ROUTE_CHUNK: [RegExp, keyof typeof load][] = [
  [/^\/$/, 'Home'], [/^\/(about|contact)$/, 'Company'], [/^\/(verify|privacy|terms|refund-policy)$/, 'Legal'], [/^\/research/, 'Research'], [/^\/services/, 'Services'], [/^\/learn/, 'Learn'], [/^\/(science|solutions|industry)$/, 'Science'],
  [/^\/vedicgen$/, 'VgHome'], [/^\/vedicgen\/courses$/, 'Catalogue'], [/^\/vedicgen\/courses\/./, 'CourseDetail'], [/^\/vedicgen\/programs/, 'Programs'], [/^\/vedicgen\/internships/, 'Internships'],
  [/^\/vedicgen\/(workshops|research-training|institutions)$/, 'Training'], [/^\/vedicgen\/(pricing|apply)$/, 'Admissions'],
  [/^\/nayancode$/, 'NcHome'], [/^\/nayancode\/products/, 'Products'], [/^\/nayancode\/tools/, 'Tools'], [/^\/nayancode\/(docs|pricing|demo)$/, 'Support'],
];
const done = new Set<string>();
/** Start downloading the chunk for a public route (no-op for Workbench routes and repeated calls). */
export function prefetchRoute(path: string) {
  const p = path.replace(/\/+$/, '') || '/';
  const hit = ROUTE_CHUNK.find(([re]) => re.test(p));
  if (!hit || done.has(hit[1])) return;
  done.add(hit[1]);
  load[hit[1]]().catch(() => done.delete(hit[1]));
}
