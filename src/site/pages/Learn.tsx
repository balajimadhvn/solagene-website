import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '../Link';
import { BRAND } from '@/core/brand';
import { ArticleRow, authorOf, fmtDate, ShareLinks } from '../blocks';
import { ARTICLE_CATS, articleBySlug, readingMinutes, type ArticleCat } from '../data/articles';
import { ARTICLES, courseBySlug, toolBySlug } from '../data/lite';
import { FIGURES } from '../figures';
import { Newsletter } from '../Form';
import { I } from '../icons';
import Markdown, { headings } from '../Markdown';
import { Crumbs, PageHeader, Reveal, useScrollSpy } from '../primitives';
import { abs } from '../url';
import NotFound from './NotFound';

export function LearnHub() {
  const [cat, setCat] = useState<'All' | ArticleCat>('All');
  const [q, setQ] = useState('');
  const s = q.trim().toLowerCase();
  const list = useMemo(() => ARTICLES.filter((a) => (cat === 'All' || a.category === cat) && (!s || [a.title, a.description, a.category, ...a.keywords].join(' ').toLowerCase().includes(s))), [cat, s]);
  const filtered = cat !== 'All' || !!s;
  const lead = ARTICLES[0];
  const leadCourse = lead.course ? courseBySlug(lead.course) : undefined;
  const LeadFig = leadCourse ? FIGURES[leadCourse.figure] : FIGURES.volcano;
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Knowledge hub', path: '/learn' }]} label="Knowledge hub" title="Tutorials and guides for life scientists"
        lede="Practical, carefully checked guides on bioinformatics workflows, file formats, statistics, drug discovery, wet-lab techniques and careers. Each links to a free Nayancode tool you can try and a Vedicgen course that goes further." />

      {!filtered && (
        <section className="section section--tight" aria-labelledby="featured-h">
          <div className="container">
            <Link to={`/learn/${lead.slug}`} className="feature-article">
              <div className="stack-sm">
                <p className="label">Featured · {lead.category}</p>
                <h2 id="featured-h">{lead.title}</h2>
                <p className="lede">{lead.description}</p>
                <p className="byline"><span><b>{authorOf(lead)}</b></span><span><time dateTime={lead.updated ?? lead.published}>{fmtDate(lead.updated ?? lead.published)}</time></span><span>{lead.minutes} min read</span></p>
                <span className="textlink">Read the guide <I.Arrow width={15} height={15} /></span>
              </div>
              <div className="figure-frame" aria-hidden inert><LeadFig.C /></div>
            </Link>
          </div>
        </section>
      )}

      <section className={`section ${filtered ? '' : 'section--flush-top'}`} aria-labelledby="all-h">
        <div className="container">
          <h2 id="all-h" className="sr-only">All guides</h2>
          <div className="toolbar" role="search" aria-label="Filter guides">
            <label className="searchbox"><span className="sr-only">Search guides</span><I.Search width={17} height={17} /><input type="search" placeholder="Search guides, e.g. VCF, DESeq2, docking" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search guides" />{q && <button type="button" className="clear" onClick={() => setQ('')} aria-label="Clear search"><I.X width={14} height={14} /></button>}</label>
            <div className="chips-row" role="group" aria-label="Filter by category">{(['All', ...ARTICLE_CATS] as const).map((c) => <button type="button" key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}<span className="ct">{c === 'All' ? ARTICLES.length : ARTICLES.filter((a) => a.category === c).length}</span></button>)}</div>
            <span className="toolbar-count" aria-live="polite">{list.length} of {ARTICLES.length} guides</span>
          </div>
          {list.length ? <div>{list.map((a, i) => <ArticleRow key={a.slug} a={a} index={i} />)}</div>
            : <div className="empty" style={{ marginTop: 24 }}><b>No guide matches your search.</b><span>Try another term or category.</span><button type="button" className="button button--secondary button--sm" onClick={() => { setQ(''); setCat('All'); }}>Show all guides</button></div>}
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="news-h">
        <div className="container split-7-5 align-center">
          <Reveal className="stack-sm"><p className="label">Newsletter</p><h2 id="news-h">One practical guide a month.</h2><p className="muted">New tutorials, new free tools and announcements of course batches, by e-mail. No advertising, and you can unsubscribe at any time.</p></Reveal>
          <Reveal index={1}><Newsletter /></Reveal>
        </div>
      </section>
    </>
  );
}

function useReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const f = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const el = document.getElementById('article-body'); if (!el) return; const r = el.getBoundingClientRect(); const total = r.height - window.innerHeight * 0.6; setP(Math.max(0, Math.min(1, total > 0 ? -r.top / total : 0))); }); };
    f(); window.addEventListener('scroll', f, { passive: true }); window.addEventListener('resize', f);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', f); window.removeEventListener('resize', f); };
  }, []);
  return p;
}

export function ArticlePage() {
  const { slug = '' } = useParams();
  const a = articleBySlug(slug);
  const toc = useMemo(() => (a ? headings(a.body) : []), [a]);
  const active = useScrollSpy(toc.map((h) => h.id));
  const progress = useReadingProgress();
  if (!a) return <NotFound />;
  const course = a.course ? courseBySlug(a.course) : undefined;
  const tool = a.tool ? toolBySlug(a.tool) : undefined;
  const more = ARTICLES.filter((x) => x.slug !== a.slug).sort((x, y) => Number(y.category === a.category) - Number(x.category === a.category) || Number(y.course === a.course) - Number(x.course === a.course)).slice(0, 3);
  const url = abs(`/learn/${a.slug}`);
  return (
    <>
      <div className="read-progress no-print" style={{ ['--p' as string]: progress }} aria-hidden />
      <header className="phead">
        <div className="container">
          <Crumbs items={[{ name: 'Home', path: '/' }, { name: 'Knowledge hub', path: '/learn' }, { name: a.title, path: `/learn/${a.slug}` }]} />
          <div className="phead-copy intro-rise" style={{ maxWidth: 860 }}>
            <p className="label">{a.category}</p>
            <h1 style={{ maxWidth: '24ch' }}>{a.title}</h1>
            <p className="lede">{a.description}</p>
            <div className="byline">
              <span>By <b>{authorOf(a)}</b></span>
              <span><I.Calendar width={15} height={15} />{a.updated && a.updated !== a.published ? <>Updated <time dateTime={a.updated}>{fmtDate(a.updated)}</time></> : <>Published <time dateTime={a.published}>{fmtDate(a.published)}</time></>}</span>
              <span><I.Clock width={15} height={15} />{readingMinutes(a.body)} min read</span>
            </div>
            <ShareLinks url={url} title={a.title} />
          </div>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 'clamp(40px, 5vw, 64px)' }}>
        <div className="container reading">
          <article className="prose" id="article-body">
            <Markdown source={a.body} />
            {(course || tool) && (
              <div className="stack-sm" style={{ marginTop: 48 }}>
                {course && <div className="notice"><I.Info width={18} height={18} /><span><b>Go further.</b> {course.title}: {course.short} <Link to={`/vedicgen/courses/${course.slug}`} className="ulink">View the course</Link>.</span></div>}
                {tool && <div className="notice"><I.Info width={18} height={18} /><span><b>Try it.</b> {tool.name}: {tool.short} Free, and nothing is uploaded. <Link to={`/nayancode/tools/${tool.slug}`} className="ulink">Open the tool</Link>.</span></div>}
              </div>
            )}
            <p className="small subtle" style={{ marginTop: 32 }}>Written by the {BRAND.name} team for research and education. Found an error? <Link to="/contact" className="ulink">Tell us</Link> and we will correct it.</p>
          </article>
          <nav className="toc no-print" aria-label="On this page">
            <p className="label">On this page</p>
            {toc.map((h) => <a key={h.id} href={`#${h.id}`} className={active === h.id ? 'is-active' : ''} onClick={(e) => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); history.replaceState(null, '', `#${h.id}`); }}>{h.text.replace(/`/g, '')}</a>)}
            <div className="toc-block"><p className="label">Share</p><ShareLinks url={url} title={a.title} /></div>
          </nav>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="more-h">
        <div className="container">
          <Reveal className="sec-head sec-head--compact"><p className="label">Related reading</p><h2 id="more-h">Keep reading</h2></Reveal>
          <div className="index">{more.map((m, i) => <ArticleRow key={m.slug} a={m} index={i} />)}</div>
          <p style={{ marginTop: 24 }}><Link to="/learn" className="textlink">All guides <I.Arrow width={15} height={15} /></Link></p>
        </div>
      </section>
    </>
  );
}
