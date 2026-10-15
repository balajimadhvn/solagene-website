import { Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { lazyRetry } from '@/core/lazy';
import { STUDIOS } from '@/core/studios';
import { PAGES, prefetchRoute } from '@/site/pages.lazy';
import { setPrefetch } from '@/site/prefetch';
import { siteRoutes } from '@/site/routes';

// The Workbench is loaded on demand, so visitors to the public site never download it.
const Shell = lazyRetry(() => import('@/ui/Shell').then((m) => ({ default: m.Shell })));
const Overview = lazyRetry(() => import('@/pages/Overview'));
const Licenses = lazyRetry(() => import('@/pages/Licenses'));
const Report = lazyRetry(() => import('@/pages/Report'));
const Atlas = lazyRetry(() => import('@/pages/Atlas'));
const ImportWizard = lazyRetry(() => import('@/pages/ImportWizard'));
const live: Record<string, ReturnType<typeof lazyRetry<() => React.JSX.Element>>> = {
  sequence: lazyRetry(() => import('@/studios/sequence/SequenceStudio')),
  expression: lazyRetry(() => import('@/studios/expression/ExpressionStudio')),
  chemistry: lazyRetry(() => import('@/studios/chemistry/ChemistryStudio')),
  structure: lazyRetry(() => import('@/studios/structure/StructureStudio')),
  phylo: lazyRetry(() => import('@/studios/phylo/PhyloStudio')),
  genome: lazyRetry(() => import('@/studios/genome/GenomeStudio')),
  variant: lazyRetry(() => import('@/studios/variants/VariantStudio')),
  singlecell: lazyRetry(() => import('@/studios/singlecell/SingleCellStudio')),
  microbiome: lazyRetry(() => import('@/studios/microbiome/MicrobiomeStudio')),
};
setPrefetch(prefetchRoute);

const Loading = () => <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', color: 'var(--text-faint)' }}>Loading…</div>;
const L = ({ children }: { children: ReactNode }) => <Suspense fallback={<Loading />}>{children}</Suspense>;

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
      <Routes>
        {siteRoutes(PAGES)}
        <Route element={<L><Shell /></L>}>
          <Route path="/workbench" element={<L><Overview /></L>} />
          <Route path="/licenses" element={<L><Licenses /></L>} />
          <Route path="/report" element={<L><Report /></L>} />
          <Route path="/atlas" element={<L><Atlas /></L>} />
          <Route path="/import" element={<L><ImportWizard /></L>} />
          {STUDIOS.map((s) => { const C = live[s.id]; return <Route key={s.id} path={s.path} element={<C />} />; })}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
