import { Link } from './Link';
import { BRAND } from '@/core/brand';
import type { LiteArticle } from './data/lite';
import { Volcano } from './figures';
import { I } from './icons';
import { Reveal, useCopy } from './primitives';

export const fmtDate = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
/** Workflow steps as a labelled pipeline (HTML, so it stays legible and reflows to vertical on small screens). */
export function Pipeline({ steps, label }: { steps: { t: string; d?: string }[]; label?: string }) {
  return (
    <Reveal as="ol" className="pipe" style={{ ['--n' as string]: steps.length }}>
      {steps.map((s, i) => <li key={s.t} style={{ ['--i' as string]: i }} aria-label={label ? `${label} step ${i + 1}: ${s.t}` : undefined}><span className="pipe-node"><i aria-hidden />{s.t}</span>{s.d && <span className="pipe-note">{s.d}</span>}</li>)}
    </Reveal>
  );
}

/** Illustration of what a delivered analysis contains. Clearly labelled: not from a client project. */
export function ReportFigure({ title = 'RNA-seq analysis report' }: { title?: string }) {
  return (
    <figure className="figure">
      <div className="report">
        <div className="report-head"><b>{title}</b><span className="tag tag--plain">Example</span></div>
        <div className="report-body">
          <div className="report-plot"><Volcano /></div>
          <div className="report-side">
            <div><small>Samples passing QC</small><b>12 of 12</b></div>
            <div><small>Genes tested</small><b>18,204</b></div>
            <div><small>Significant at 5% FDR</small><b>612</b></div>
            <div><small>Design</small><b className="xsmall mono" style={{ fontSize: 13 }}>~ batch + condition</b></div>
          </div>
        </div>
        <div className="report-files">{['report.html', 'de_results.csv', 'figures.pdf', 'enrichment.xlsx', 'methods.md', 'analysis.ipynb'].map((f) => <span key={f} className="tag">{f}</span>)}</div>
      </div>
      <figcaption className="figcaption"><b>Fig.</b>An example of the files delivered at the end of an RNA-seq project. The numbers are illustrative, not from a client project.</figcaption>
    </figure>
  );
}

/* ---------- tools ---------- */
export function ToolLink({ t }: { t: { slug: string; name: string; short: string } }) {
  return <Link to={`/nayancode/tools/${t.slug}`}><b>{t.name}</b><span>{t.short}</span><I.Arrow width={16} height={16} /></Link>;
}

/* ---------- articles ---------- */
export function ArticleRow({ a, index = 0 }: { a: LiteArticle; index?: number }) {
  return (
    <Reveal index={index % 6}>
      <Link to={`/learn/${a.slug}`} className="arow">
        <span className="label">{a.category}</span>
        <div><h3>{a.title}</h3><p>{a.description}</p></div>
        <span className="when"><time dateTime={a.updated ?? a.published}>{fmtDate(a.updated ?? a.published)}</time><br />{a.minutes} min read</span>
        <I.Arrow width={16} height={16} />
      </Link>
    </Reveal>
  );
}

/* ---------- sharing ---------- */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [ok, copy] = useCopy();
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  return (
    <div className="share" aria-label="Share this article">
      <button type="button" onClick={() => copy(url)} aria-live="polite">{ok ? <><I.Check width={14} height={14} />Link copied</> : <><I.Link width={14} height={14} />Copy link</>}</button>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn"><I.LinkedIn width={14} height={14} /></a>
      <a href={`https://x.com/intent/post?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X"><I.XLogo width={13} height={13} /></a>
      <a href={`mailto:?subject=${t}&body=${encodeURIComponent(`${title}\n${url}`)}`} aria-label="Share by e-mail"><I.Mail width={14} height={14} /></a>
    </div>
  );
}

/** Author line: a named team member when articles carry one, otherwise the organisation (never an invented person). */
export const authorOf = (a: { author?: string }) => a.author ?? `${BRAND.name} editorial team`;
