import { asset } from './brand';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { DISCIPLINE_LABEL, durationOf, FORMAT_SHORT, inr, schoolOf, type LiteCourse, type School } from './data/course-types';
import { STATUS_LABEL } from './data/labels';
import type { LiteInternship, LiteProduct, LiteService } from './data/lite';
import { programListPrice, programParts, type Program } from './data/programs';
import type { ResearchStatus } from './data/research';
import { I } from './icons';
import { Link } from './Link';
import { Reveal } from './primitives';

export const SCHOOL_ICON: Record<School, (p: React.SVGProps<SVGSVGElement>) => React.JSX.Element> = { bioinformatics: I.Dna, biotechnology: I.Flask, computing: I.Code, 'life-sciences': I.Book };

export function DiscBadge({ d }: { d: 'dry' | 'wet' | 'hybrid' }) {
  const Ic = d === 'wet' ? I.Flask : d === 'hybrid' ? I.Layers : I.Code;
  return <span className={`disc disc--${d}`}><Ic width={13} height={13} />{DISCIPLINE_LABEL[d]}</span>;
}
export function StatusBadge({ s }: { s: 'available' | 'on-request' | 'planned' }) { return <span className={`st st--${s}`}>{STATUS_LABEL[s]}</span>; }
export function ResearchBadge({ s }: { s: ResearchStatus }) { return <span className={`st st--${s === 'Active' ? 'available' : s === 'Building' ? 'on-request' : 'planned'}`}>{s}</span>; }

/** Counts up once when scrolled into view. The server renders the final number, so it is correct without JS. */
export function CountUp({ to, suffix = '', duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setN(0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => { const k = Math.min(1, (now - t0) / duration); setN(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref} className="tnum">{n.toLocaleString('en-IN')}{suffix}</span>;
}

export function Fee({ amount, from, note = '+ GST' }: { amount: number; from?: boolean; note?: string }) {
  if (amount === 0) return <span className="fee"><b>No fee</b></span>;
  return <span className="fee">{from && <small>from </small>}<b>{inr(amount)}</b>{note && <small> {note}</small>}</span>;
}

export function CourseCard({ c, index = 0 }: { c: LiteCourse; index?: number }) {
  const S = schoolOf(c.school);
  const Ic = SCHOOL_ICON[c.school];
  return (
    <Reveal index={index % 6} className="ccard-wrap">
      <Link to={`/vedicgen/courses/${c.slug}`} className={`ccard ccard--${c.school}`}>
        <div className="ccard-top"><span className="ccard-school" title={S.name}><Ic width={14} height={14} />{c.category}</span><DiscBadge d={c.discipline} /></div>
        <h3>{c.title}</h3>
        <p>{c.short}</p>
        <div className="ccard-meta">
          <span className={`level level--${c.level.toLowerCase()}`}>{c.level}</span>
          <span><I.Clock width={13} height={13} />{c.days ? `${c.days} days` : `≤ ${c.weeks} weeks`}</span>
          <span>{c.formats.map((f) => FORMAT_SHORT[f]).join(' · ')}</span>
        </div>
        <div className="ccard-foot"><Fee amount={c.from} from={c.formats.length > 1} /><span className="ccard-go">View course <I.Arrow width={15} height={15} /></span></div>
      </Link>
    </Reveal>
  );
}

export function CourseRowCompact({ c }: { c: LiteCourse }) {
  return <Link to={`/vedicgen/courses/${c.slug}`} className="crow"><span className="crow-t"><b>{c.title}</b><small>{durationOf(c, c.formats[0])}</small></span><DiscBadge d={c.discipline} /><Fee amount={c.from} from={c.formats.length > 1} /><I.Arrow width={15} height={15} /></Link>;
}

export function ProgramCard({ p, index = 0 }: { p: Program; index?: number }) {
  const list = programListPrice(p);
  return (
    <Reveal index={index % 6} className="ccard-wrap">
      <Link to={`/vedicgen/programs/${p.slug}`} className={`pcard pcard--${p.discipline}`}>
        <div className="ccard-top"><span className="ccard-school"><I.Award width={14} height={14} />~{p.months} months, flexible · {p.format}</span><DiscBadge d={p.discipline} /></div>
        <h3>{p.title}</h3>
        <p>{p.short}</p>
        <ol className="pcard-steps">{programParts(p).map((c) => <li key={c.slug}>{c.title}</li>)}</ol>
        <div className="ccard-foot"><span className="fee"><b>{inr(p.fee)}</b><small> + GST</small>{list > p.fee && <s>{inr(list)}</s>}</span><span className="ccard-go">View programme <I.Arrow width={15} height={15} /></span></div>
      </Link>
    </Reveal>
  );
}

export function InternshipCard({ x: y, index = 0 }: { x: Pick<LiteInternship, 'slug' | 'title' | 'short' | 'mode' | 'discipline' | 'options'>; index?: number }) {
  const x = { ...y, weeks: [...new Set(y.options.map((o) => o.weeks))], from: Math.min(...y.options.map((o) => o.fee)) };
  return (
    <Reveal index={index % 6} className="ccard-wrap">
      <Link to={`/vedicgen/internships/${x.slug}`} className={`icard icard--${x.discipline}`}>
        <div className="ccard-top"><span className="ccard-school"><I.Pin width={14} height={14} />{x.mode}</span><DiscBadge d={x.discipline} /></div>
        <h3>{x.title}</h3>
        <p>{x.short}</p>
        <div className="ccard-meta"><span><I.Clock width={13} height={13} />{x.weeks.join(', ')} weeks</span></div>
        <div className="ccard-foot"><Fee amount={x.from} from={x.from > 0} /><span className="ccard-go">Details & apply <I.Arrow width={15} height={15} /></span></div>
      </Link>
    </Reveal>
  );
}

export function ProductCard({ p, index = 0, big }: { p: LiteProduct; index?: number; big?: boolean }) {
  return (
    <Reveal index={index % 6} className="ccard-wrap">
      <Link to={`/nayancode/products/${p.slug}`} className={`prcard ${big ? 'prcard--big' : ''}`}>
        <div className="prcard-shot"><img src={asset(p.shot)} alt={`Screenshot of ${p.name}`} loading="lazy" width={1280} height={800} /></div>
        <div className="prcard-body">
          <span className="label">{p.line}</span>
          <h3>{p.name.replace('Nayancode ', '')}</h3>
          <p>{p.tagline}</p>
          <span className="ccard-go">Explore <I.Arrow width={15} height={15} /></span>
        </div>
      </Link>
    </Reveal>
  );
}

export function ServiceCard({ s: x, index = 0 }: { s: Pick<LiteService, 'slug' | 'title' | 'short' | 'category'> & { status?: LiteService['status']; discipline?: 'dry' | 'wet' }; index?: number }) {
  const s = { ...x, status: x.status ?? 'available' };
  return (
    <Reveal index={index % 6} className="ccard-wrap">
      <Link to={`/services/${s.slug}`} className={`scard scard--${s.status}`}>
        <div className="ccard-top"><span className="ccard-school">{s.discipline === 'wet' ? <I.Flask width={14} height={14} /> : s.category === 'Bio-IT & software' ? <I.Cloud width={14} height={14} /> : <I.Code width={14} height={14} />}{s.category}</span></div>
        <h3>{s.title}</h3>
        <p>{s.short}</p>
        <span className="ccard-go">{s.status === 'planned' ? 'Register interest' : 'Scope & quote'} <I.Arrow width={15} height={15} /></span>
      </Link>
    </Reveal>
  );
}

/** Large heading block for bands with a coloured kicker. */
export function Kicker({ children, tone }: { children: ReactNode; tone?: 'vg' | 'nc' | 'vf' }) { return <p className={`kicker ${tone ? `kicker--${tone}` : ''}`}>{children}</p>; }
