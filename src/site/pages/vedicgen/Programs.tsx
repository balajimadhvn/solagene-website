import { useParams } from 'react-router-dom';
import { BRAND } from '@/core/brand';
import { DRY_ELIGIBILITY, inr, PROGRAM_FLEX_NOTE, WET_ELIGIBILITY, withGst } from '../../data/course-types';
import { feeOf } from '../../data/lite';
import { PROGRAMS, programBySlug, programLength, programListPrice, programParts } from '../../data/programs';
import { ApplicationForm } from '../../Form';
import { I } from '../../icons';
import { Link } from '../../Link';
import { FaqSection, jump, PageHeader, Reveal } from '../../primitives';
import { CourseCard, DiscBadge, ProgramCard } from '../../ui';
import NotFound from '../NotFound';

const FAQ = [
  { q: 'How is a programme different from buying the courses separately?', a: 'A programme puts the courses in the right order, adds an integrated capstone reviewed by a panel, and costs less than the courses bought one by one. You also get a single programme certificate in addition to each course certificate.' },
  { q: 'Can I pay in instalments?', a: 'Yes. Programme fees can be paid in up to three instalments aligned with the start of each course. Ask for an instalment plan when you apply.' },
  { q: 'What if I already know part of the material?', a: 'Tell us in your application. If you can show prior learning, an adviser can replace a course with a more advanced one or adjust the fee accordingly.' },
  { q: 'How long does a programme take, and can I change it?', a: 'The length shown is typical, and the pace is customisable. Each course runs for four weeks at most; you can fast-track by taking courses back to back, or go part-time and spread them out. Live programmes follow a cohort calendar. If you need to pause, you can move to the next cohort of the remaining courses once, at no extra cost.' },
];

export function ProgramsHub() {
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Vedicgen', path: '/vedicgen' }, { name: 'Programmes', path: '/vedicgen/programs' }]} label="Vivofold Vedicgen · Professional programmes" title="Professional programmes: a path, not a pile of courses"
        lede={`${PROGRAMS.length} programmes that combine courses in the right order with an integrated capstone, priced below the courses bought separately. Dry lab online, wet lab in person, or both.`} />
      <section className="section">
        <div className="container"><div className="cgrid">{PROGRAMS.map((p, i) => <ProgramCard key={p.slug} p={p} index={i} />)}</div></div>
      </section>
      <section className="section section--alt" aria-labelledby="cmp-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Compare</p><h2 id="cmp-h">Programmes at a glance</h2></div></Reveal>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)"><table className="ptable">
            <thead><tr><th scope="col">Programme</th><th scope="col">Format</th><th scope="col">Length</th><th scope="col">Courses</th><th scope="col">Courses separately</th><th scope="col">Programme fee</th></tr></thead>
            <tbody>{PROGRAMS.map((p) => <tr key={p.slug}><th scope="row"><Link to={`/vedicgen/programs/${p.slug}`} className="ulink">{p.title}</Link></th><td>{p.format}</td><td>~{p.months} months, flexible</td><td>{p.steps.length}</td><td><s>{inr(programListPrice(p))}</s></td><td className="num">{inr(p.fee)} + GST</td></tr>)}</tbody>
          </table></div>
        </div>
      </section>
      <FaqSection items={FAQ} />
    </>
  );
}

export function ProgramDetail() {
  const { slug = '' } = useParams();
  const p = programBySlug(slug);
  if (!p) return <NotFound />;
  const parts = programParts(p);
  const list = programListPrice(p);
  const save = list - p.fee;
  const wet = p.discipline !== 'dry';
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Vedicgen', path: '/vedicgen' }, { name: 'Programmes', path: '/vedicgen/programs' }, { name: p.title, path: `/vedicgen/programs/${p.slug}` }]}
        label={<><I.Award width={14} height={14} /> Professional programme</>} title={p.title} lede={`${p.short} ${p.who}`}
        meta={<><DiscBadge d={p.discipline} /><span><I.Clock width={15} height={15} />{programLength(p)} · {p.format}</span><span><I.Layers width={15} height={15} />{parts.length} courses + capstone</span></>}
        actions={<><a href="#apply" onClick={jump('apply')} className="button button--accent button--lg">Apply now <I.Arrow /></a><a href="#path" onClick={jump('path')} className="button button--secondary button--lg">See the courses</a></>}
        aside={<div className="enrol"><span className="status status--open">Applications open</span><div><div className="price">{inr(p.fee)} <small>+ GST</small></div><p className="small subtle" style={{ marginTop: 6 }}>{inr(withGst(p.fee))} incl. GST{save > 0 ? ` · save ${inr(save)} vs courses separately` : ''}</p></div><dl className="kv"><div><dt>Length</dt><dd>{programLength(p)}</dd></div><div><dt>Format</dt><dd>{p.format}</dd></div><div><dt>Instalments</dt><dd>Up to 3 on request</dd></div></dl><a href="#apply" onClick={jump('apply')} className="button button--accent button--block">Apply now <I.Arrow /></a></div>} />

      <section className="section" id="path" aria-labelledby="path-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">The path</p><h2 id="path-h">{parts.length} courses, in order</h2></div><p className="lede">{p.outcome} {PROGRAM_FLEX_NOTE}</p></Reveal>
          <ol className="ppath">
            {parts.map((c, i) => <Reveal as="li" key={c.slug} index={i}><span className="ppath-n">{String(i + 1).padStart(2, '0')}</span><div className="ppath-body"><Link to={`/vedicgen/courses/${c.slug}`}><b>{c.title}</b></Link><p>{c.short}</p><span className="ppath-meta">{c.level} · {c.days ? `${c.days} days in the lab` : `up to ${c.weeks} weeks`} · {inr(feeOf(c, c.formats.includes('live') ? 'live' : c.formats[0])!)} separately</span></div><DiscBadge d={c.discipline} /></Reveal>)}
            <Reveal as="li" index={parts.length} className="ppath-cap"><span className="ppath-n"><I.Award width={18} height={18} /></span><div className="ppath-body"><b>Integrated capstone</b><p>{p.capstone}</p></div></Reveal>
          </ol>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="elig-h">
        <div className="container col2">
          <Reveal className="stack-sm"><p className="kicker kicker--vg">Eligibility</p><h2 id="elig-h" style={{ fontSize: 'clamp(1.5rem, 1.2rem + 0.8vw, 2rem)' }}>Who can apply</h2><ul className="checks checks--ink">{(wet ? WET_ELIGIBILITY : DRY_ELIGIBILITY).map((e) => <li key={e}>{e}</li>)}</ul></Reveal>
          <Reveal index={1} className="stack-sm"><p className="kicker kicker--vg">You receive</p><h2 style={{ fontSize: 'clamp(1.5rem, 1.2rem + 0.8vw, 2rem)' }}>What is included</h2><ul className="checks checks--ink"><li>All {parts.length} courses in their {p.format.toLowerCase()} format</li><li>An integrated capstone reviewed by a panel</li><li>A programme certificate and a certificate for each course, each with a verification ID</li><li>An adviser who reviews your progress between courses</li>{wet && <li>All reagents, consumables and protective equipment for the bench courses</li>}</ul></Reveal>
        </div>
      </section>

      <section className="section" id="apply" aria-labelledby="apply-h">
        <div className="container split-4-8 align-start">
          <div className="rail-head"><p className="kicker kicker--vg">Apply</p><h2 id="apply-h">Apply for this programme</h2><p className="muted">An adviser replies within two working days with the cohort calendar and an instalment plan if you want one.</p><p className="small subtle"><a className="ulink" href={`mailto:${BRAND.emails.help}`}>{BRAND.emails.help}</a></p></div>
          <Reveal className="form-card"><ApplicationForm kind="Programme application" programme={p.title} options={[p.title]} wet={wet} minSop={60} /></Reveal>
        </div>
      </section>
      <FaqSection items={FAQ} alt />
      <section className="section" aria-labelledby="c-h"><div className="container"><Reveal className="band-head"><div><p className="kicker kicker--vg">Courses in this programme</p><h2 id="c-h">Look inside each course</h2></div></Reveal><div className="cgrid">{parts.map((c, i) => <CourseCard key={c.slug} c={c} index={i} />)}</div></div></section>
    </>
  );
}
