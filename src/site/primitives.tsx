import { useEffect, useId, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { Link } from './Link';
import { I } from './icons';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
/** Click handler for in-page anchor links: smooth scroll and keep the hash in the URL. */
export const jump = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); scrollToId(id); history.replaceState(null, '', `#${id}`); };

/* ---------- reveal on scroll ----------
   Server-rendered content is always visible. After hydration, only elements that start below the fold are "armed"
   (hidden, offset) and revealed once when they scroll into view, so nothing on screen ever flashes or disappears. */
let io: IntersectionObserver | null = null;
const observer = () => (io ??= new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { (e.target as HTMLElement).dataset.reveal = 'in'; io!.unobserve(e.target); }
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 }));

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || el.dataset.reveal) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.94) return;
    el.dataset.reveal = 'armed';
    observer().observe(el);
    return () => { observer().unobserve(el); if (el.dataset.reveal === 'armed') delete el.dataset.reveal; };
  }, []);
  return ref;
}

export function Reveal({ children, index = 0, className, style, as: Tag = 'div', id }: { children: ReactNode; index?: number; className?: string; style?: CSSProperties; as?: ElementType; id?: string }) {
  const ref = useReveal<HTMLElement>();
  return <Tag ref={ref} id={id} className={className} style={index ? { ...style, ['--i' as string]: index } : style}>{children}</Tag>;
}

export function Arrow({ size = 16 }: { size?: number }) { return <I.Arrow width={size} height={size} />; }

/** Keep hyphenated terms (RNA-seq, Single-Cell, structure-based) on one line in headings. */
export function keepHyphens(text: ReactNode): ReactNode {
  if (typeof text !== 'string') return text;
  return text.split(/(\S+-\S+)/).map((part, i) => (i % 2 ? <span key={i} style={{ whiteSpace: 'nowrap' }}>{part}</span> : part));
}

/* ---------- headers ---------- */
export interface Crumb { name: string; path: string }
export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>{items.map((c, i) => <li key={c.path + i}>{i < items.length - 1 ? <Link to={c.path}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}</li>)}</ol>
    </nav>
  );
}

export function PageHeader({ crumbs, label, title, lede, actions, aside, meta, tone, children }: { crumbs?: Crumb[]; label?: ReactNode; title: ReactNode; lede?: ReactNode; actions?: ReactNode; aside?: ReactNode; meta?: ReactNode; tone?: 'alt'; children?: ReactNode }) {
  return (
    <header className={`phead ${tone === 'alt' ? 'phead--alt' : ''}`}>
      <div className="container">
        {crumbs && <Crumbs items={crumbs} />}
        <div className={`phead-grid ${aside ? '' : 'phead-grid--single'}`}>
          <div className="phead-copy intro-rise">
            {label && <p className="label">{label}</p>}
            <h1>{keepHyphens(title)}</h1>
            {lede && <p className="lede">{lede}</p>}
            {meta && <div className="phead-meta">{meta}</div>}
            {actions && <div className="phead-actions">{actions}</div>}
            {children}
          </div>
          {aside && <div className="phead-aside">{aside}</div>}
        </div>
      </div>
    </header>
  );
}

export function SectionHead({ label, index, title, lede, action, variant, id, compact }: { label?: ReactNode; index?: string; title: ReactNode; lede?: ReactNode; action?: ReactNode; variant?: 'stack' | 'center'; id?: string; compact?: boolean }) {
  return (
    <Reveal className={`sec-head ${variant ? `sec-head--${variant}` : ''} ${compact ? 'sec-head--compact' : ''}`}>
      {label && <p className="label">{index && <span className="idx">{index}</span>}{label}</p>}
      <h2 id={id}>{title}</h2>
      {(lede || action) && <div className="sec-side">{lede && (typeof lede === 'string' ? <p className="lede">{lede}</p> : lede)}{action}</div>}
    </Reveal>
  );
}

/* ---------- accordion ---------- */
export interface AccItem { q: ReactNode; a: ReactNode; lead?: ReactNode; meta?: ReactNode; id?: string }
export function Accordion({ items, defaultOpen = [0], className = '', level = 3, expandAll = false }: { items: AccItem[]; defaultOpen?: number[]; className?: string; level?: 3 | 4; expandAll?: boolean }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(defaultOpen));
  const uid = useId();
  const H = (level === 4 ? 'h4' : 'h3') as ElementType;
  const all = open.size === items.length;
  const toggle = (i: number) => setOpen((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  return (
    <div className={className}>
      {expandAll && <div className="acc-tools"><button type="button" className="button button--ghost button--sm" onClick={() => setOpen(all ? new Set() : new Set(items.map((_, i) => i)))} aria-pressed={all}>{all ? <><I.Minus width={14} height={14} />Collapse all</> : <><I.Plus width={14} height={14} />Expand all</>}</button></div>}
      <div className="acc">
        {items.map((it, i) => {
          const o = open.has(i), bid = `${uid}b${i}`, pid = `${uid}p${i}`;
          return (
            <div key={i} id={it.id} className={`acc-item ${o ? 'is-open' : ''}`}>
              <H><button type="button" className="acc-btn" id={bid} aria-expanded={o} aria-controls={pid} onClick={() => toggle(i)}>
                {it.lead !== undefined && <span className="mod-n">{it.lead}</span>}
                <span className="acc-q">{it.q}</span>
                {it.meta !== undefined && <span className="mod-c">{it.meta}</span>}
                <span className="acc-ic" aria-hidden />
              </button></H>
              <div className="acc-panel" id={pid} role="region" aria-labelledby={bid}><div><div className="acc-body">{typeof it.a === 'string' ? <p>{it.a}</p> : it.a}</div></div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FaqSection({ items, title = 'Frequently asked questions', lede, id = 'faq', alt }: { items: { q: string; a: string }[]; title?: ReactNode; lede?: ReactNode; id?: string; alt?: boolean }) {
  return (
    <section className={`section ${alt ? 'section--alt' : 'section--ruled'}`} id={id} aria-labelledby={`${id}-h`}>
      <div className="container rail">
        <div className="rail-head">
          <p className="label">FAQ</p>
          <h2 id={`${id}-h`}>{title}</h2>
          {lede ?? <p className="muted">Not answered here? <Link to="/contact" className="ulink">Send us your question</Link> and we will reply by e-mail.</p>}
        </div>
        <Reveal><Accordion items={items} defaultOpen={[]} /></Reveal>
      </div>
    </section>
  );
}

/** Closing call to action, addressed to the two audiences separately. */
export function CtaSplit({ left, right, label = 'Next step' }: { left: { title: ReactNode; body: ReactNode; cta: ReactNode }; right: { title: ReactNode; body: ReactNode; cta: ReactNode }; label?: string }) {
  return (
    <section className="section" aria-label={label}>
      <div className="container">
        <Reveal className="cta2">
          <div><p className="label">For learners</p><h2>{left.title}</h2><p>{left.body}</p>{left.cta}</div>
          <div><p className="label">For research teams</p><h2>{right.title}</h2><p>{right.body}</p>{right.cta}</div>
        </Reveal>
      </div>
    </section>
  );
}

export function CtaBand({ label, title, body, actions }: { label?: string; title: ReactNode; body?: ReactNode; actions: ReactNode }) {
  return (
    <section className="section section--tight">
      <div className="container">
        <Reveal className="cta-band">
          <div>{label && <p className="label" style={{ marginBottom: 14 }}>{label}</p>}<h2>{title}</h2>{body && <p>{body}</p>}</div>
          <div className="inline">{actions}</div>
        </Reveal>
      </div>
    </section>
  );
}

/** Definition-list strip of key facts. */
export function Facts({ items, cols }: { items: [ReactNode, ReactNode][]; cols?: number }) {
  return <dl className="facts" style={{ ['--n' as string]: cols ?? items.length }}>{items.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}

/* ---------- keyboard support for tab lists (WAI-ARIA Authoring Practices) ---------- */
export function tabKeys<T>(e: React.KeyboardEvent, list: T[], cur: T, set: (v: T) => void, vertical = false) {
  const i = list.indexOf(cur);
  const next = vertical ? ['ArrowDown', 'ArrowRight'] : ['ArrowRight'], prev = vertical ? ['ArrowUp', 'ArrowLeft'] : ['ArrowLeft'];
  let j = -1;
  if (next.includes(e.key)) j = (i + 1) % list.length;
  else if (prev.includes(e.key)) j = (i - 1 + list.length) % list.length;
  else if (e.key === 'Home') j = 0;
  else if (e.key === 'End') j = list.length - 1;
  if (j < 0) return;
  e.preventDefault(); set(list[j]);
  const tabs = e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role=tab]');
  requestAnimationFrame(() => tabs?.[j]?.focus());
}

/** Which of the given section ids is currently in the reading zone of the viewport. */
export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '');
  const key = ids.join('|');
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const seen = new Map<string, boolean>();
    const o = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target.id, e.isIntersecting);
      const first = ids.find((id) => seen.get(id));
      if (first) setActive(first);
    }, { rootMargin: '-30% 0px -60% 0px' });
    els.forEach((el) => o.observe(el));
    return () => o.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}

/** Copy text to the clipboard, with a short confirmation state. */
export function useCopy(): [boolean, (t: string) => void] {
  const [ok, setOk] = useState(false);
  const t = useRef(0);
  useEffect(() => () => clearTimeout(t.current), []);
  return [ok, (text: string) => {
    const done = () => { setOk(true); clearTimeout(t.current); t.current = window.setTimeout(() => setOk(false), 1600); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text) && done());
    else if (fallbackCopy(text)) done();
  }];
}
function fallbackCopy(text: string) {
  const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove(); return ok;
}
