import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '../../Link';
import { STUDIOS } from '@/core/studios';
import { ToolLink } from '../../blocks';
import { courseBySlug } from '../../data/lite';
import { TOOL_GROUPS, TOOLS, toolBySlug } from '../../data/tools';
import { I } from '../../icons';
import { CtaBand, FaqSection, PageHeader, Reveal, SectionHead } from '../../primitives';
import { WIDGETS } from '../../tools/Widgets';
import NotFound from '../NotFound';

export function ToolsHub() {
  const [q, setQ] = useState('');
  const s = q.trim().toLowerCase();
  const list = useMemo(() => TOOLS.filter((t) => !s || [t.name, t.short, t.group, ...t.keywords].join(' ').toLowerCase().includes(s)), [s]);
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Nayancode', path: '/nayancode' }, { name: 'Free tools', path: '/nayancode/tools' }]} label="Free tools" title="Free bioinformatics tools that run in your browser"
        lede="Calculators for everyday sequence work, each with an explanation of how the result is computed, and nine full analysis studios. Your sequences are processed on your own device: nothing is uploaded, and there is nothing to install or sign up for.">
        <label className="searchbox" style={{ maxWidth: 520, marginTop: 8, width: '100%' }}><span className="sr-only">Search tools</span><I.Search width={17} height={17} /><input type="search" placeholder="Search tools, e.g. GC content, Tm, alignment" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search tools" />{q && <button type="button" className="clear" onClick={() => setQ('')} aria-label="Clear search"><I.X width={14} height={14} /></button>}</label>
      </PageHeader>

      <section className="section" aria-labelledby="calc-h">
        <div className="container">
          <h2 id="calc-h" className="sr-only">Sequence calculators</h2>
          <p className="subtle small" aria-live="polite" style={{ marginBottom: 8 }}>{s ? `${list.length} of ${TOOLS.length} tools match “${q.trim()}”.` : `${TOOLS.length} tools in ${TOOL_GROUPS.length} groups.`}</p>
          {list.length === 0 ? <div className="empty"><b>No tool matches “{q.trim()}”.</b><span>Try another term, or browse all tools.</span><button type="button" className="button button--secondary button--sm" onClick={() => setQ('')}>Show all tools</button></div>
            : TOOL_GROUPS.map((g) => { const ts = list.filter((t) => t.group === g); return ts.length ? <div key={g} className="group"><div className="group-head"><h3>{g}</h3><span className="label">{ts.length} tool{ts.length > 1 ? 's' : ''}</span></div><Reveal className="linkgrid">{ts.map((t) => <ToolLink key={t.slug} t={t} />)}</Reveal></div> : null; })}
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="studios-h">
        <div className="container">
          <SectionHead label="Nayancode Workbench" id="studios-h" title={`When a calculator is not enough: ${STUDIOS.length} analysis studios.`} lede="Complete workflows for sequences, genomes, variants, RNA-seq, single-cell, microbiome, cheminformatics and protein structures, each with demo data and an automatically written methods record." action={<Link to="/nayancode/products/workbench" className="button button--primary">About the Workbench <I.Arrow /></Link>} />
          <Reveal className="linkgrid">{STUDIOS.map((st) => <Link key={st.id} to={st.path}><b>{st.name}</b><span>{st.blurb}</span><I.Arrow width={16} height={16} /></Link>)}</Reveal>
        </div>
      </section>

      <CtaBand label="Go further" title="Learn what the numbers mean." body="Our courses teach the methods behind these tools on real data, with a project you can show." actions={<><Link to="/vedicgen/courses" className="button button--primary">Browse courses <I.Arrow /></Link><Link to="/learn" className="button button--secondary">Read the guides</Link></>} />
    </>
  );
}

export function ToolPage() {
  const { slug = '' } = useParams();
  const t = toolBySlug(slug);
  const W = WIDGETS[slug];
  if (!t || !W) return <NotFound />;
  const course = t.course ? courseBySlug(t.course) : undefined;
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Nayancode', path: '/nayancode' }, { name: 'Free tools', path: '/nayancode/tools' }, { name: t.name, path: `/nayancode/tools/${t.slug}` }]} label={t.group} title={t.name} lede={t.seoDescription} />
      <section className="section section--tight" aria-label="Tool">
        <div className="container">
          <div className="tool-shell">
            <div className="tool-bar"><b>{t.name}</b><span className="local"><I.Lock width={14} height={14} />Runs in your browser; nothing is uploaded</span></div>
            <W />
          </div>
        </div>
      </section>
      <section className="section section--flush-top" aria-label="About this tool">
        <div className="container reading">
          <article className="prose">
            {t.about.map((a) => <section key={a.h}><h2 id={a.h.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{a.h}</h2>{a.p.map((p) => <p key={p.slice(0, 32)}>{p}</p>)}</section>)}
            {course && <div className="notice" style={{ marginTop: 40 }}><I.Info width={18} height={18} /><span><b>Learn the method properly.</b> {course.title}: {course.short} <Link to={`/vedicgen/courses/${course.slug}`} className="ulink">View the course</Link>.</span></div>}
          </article>
          <nav className="toc" aria-label="On this page and related tools">
            <p className="label">On this page</p>
            {t.about.map((a) => <a key={a.h} href={`#${a.h.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{a.h}</a>)}
            <div className="toc-block"><p className="label">Related tools</p>{t.related.map((r) => { const x = toolBySlug(r); return x ? <Link key={r} to={`/nayancode/tools/${r}`} className="textlink textlink--ink small">{x.name}</Link> : null; })}<Link to="/nayancode/tools" className="textlink small">All free tools <I.Arrow width={14} height={14} /></Link></div>
          </nav>
        </div>
      </section>
      <FaqSection items={t.faq} alt />
    </>
  );
}
