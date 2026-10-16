import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BRAND } from '@/core/brand';
import { GST, inr, withGst } from '../../data/course-types';
import { courseBySlug } from '../../data/lite';
import { INTAKES, INTERN_PROCESS, internshipBySlug, internshipFrom, INTERNSHIPS, type Internship } from '../../data/internships';
import { Figure, FIGURES } from '../../figures';
import { ApplicationForm } from '../../Form';
import { I } from '../../icons';
import { Link } from '../../Link';
import { FaqSection, jump, PageHeader, Reveal } from '../../primitives';
import { CourseRowCompact, DiscBadge, InternshipCard } from '../../ui';
import NotFound from '../NotFound';

const HUB_FAQ = [
  { q: 'Who can apply for a Vedicgen internship?', a: 'Students from the second year of an undergraduate programme onwards (depending on the track), postgraduates, PhD students and recent graduates in the life sciences, biotechnology, pharmacy, bioinformatics, computing and related fields. Each track lists its own eligibility.' },
  { q: 'How are interns selected?', a: 'We read the whole application: academic record and relevant coursework, a statement of purpose, any projects or lab experience, a short track-specific task and a 20-minute interview. No minimum percentage is applied mechanically.' },
  { q: 'Are the internships paid?', a: 'Vedicgen training internships are fee-based and do not pay a stipend; the fee covers mentorship, computing or laboratory resources and materials. The Nayancode scientific software engineering internship is selective and has no programme fee.' },
  { q: 'Can the internship count towards my degree?', a: 'Many universities accept it. We provide joining, attendance and completion letters in your institution’s format on request.' },
  { q: 'Do you guarantee publications or jobs?', a: 'No. We never promise publications, placements or jobs. We promise serious mentorship, real work and an honest letter of recommendation where it is earned.' },
  { q: 'Is accommodation provided for wet-lab internships?', a: `No. Wet-lab internships are held in person at our laboratory; participants arrange their own accommodation and travel.` },
];

function FeeTable({ x }: { x: Internship }) {
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)"><table className="ptable">
      <thead><tr><th scope="col">Duration</th><th scope="col">Fee</th><th scope="col">Including {Math.round(GST * 100)}% GST</th></tr></thead>
      <tbody>{x.options.map((o) => <tr key={o.label}><th scope="row">{o.label}</th><td>{o.fee ? `${inr(o.fee)} + GST` : 'No programme fee'}</td><td>{o.fee ? inr(withGst(o.fee)) : '—'}</td></tr>)}</tbody>
    </table></div>
  );
}

export function InternshipsHub() {
  const [d, setD] = useState<'all' | 'dry' | 'wet' | 'hybrid'>('all');
  const list = INTERNSHIPS.filter((x) => d === 'all' || x.discipline === d);
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Vedicgen', path: '/vedicgen' }, { name: 'Internships', path: '/vedicgen/internships' }]} label="Solagene Vedicgen · Internships" title="Bioinformatics and biotechnology internships for students"
        lede={`${INTERNSHIPS.length} internship tracks in bioinformatics, drug discovery, AI, Bio-IT, geoinformatics, scientific software, molecular biology, microbiology and cell culture, plus dissertations and summer research. Remote or in the laboratory, with real projects, weekly mentor review and a verifiable certificate. Internships are fee-based training, not paid jobs.`}
        actions={<><a href="#tracks" onClick={jump('tracks')} className="button button--accent button--lg">See the tracks <I.Arrow /></a><a href="#apply" onClick={jump('apply')} className="button button--secondary button--lg">Apply now</a></>}
        aside={<Figure caption={FIGURES.workflow.caption}><FIGURES.workflow.C /></Figure>} />

      <section className="section" id="tracks" aria-labelledby="tracks-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Choose a track</p><h2 id="tracks-h">{list.length} internship tracks</h2></div>
            <div className="seg" role="group" aria-label="Filter by lab type">{([['all', 'All'], ['dry', 'Dry lab'], ['wet', 'Wet lab'], ['hybrid', 'Hybrid']] as const).map(([k, t]) => <button key={k} type="button" aria-pressed={d === k} onClick={() => setD(k)}>{t}</button>)}</div>
          </Reveal>
          <div className="cgrid" key={d}>{list.map((x, i) => <InternshipCard key={x.slug} x={x} index={i} />)}</div>
        </div>
      </section>

      <section className="section section--grad" aria-labelledby="process-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Application & selection</p><h2 id="process-h">How selection works</h2></div><p className="lede">A fair, transparent process modelled on how research institutes select summer researchers: we read every application in full, and the task and interview test reasoning, not memory.</p></Reveal>
          <Reveal as="ol" className="steps" style={{ ['--n' as string]: INTERN_PROCESS.length }}>{INTERN_PROCESS.map((p) => <li key={p.t}><h3>{p.t}</h3><p>{p.d}</p></li>)}</Reveal>
          <div className="duo" style={{ marginTop: 48 }}>
            <Reveal className="duo-card"><h3>What we look for</h3><ul className="checks checks--ink"><li>Genuine curiosity and a clear reason for choosing the track</li><li>Relevant coursework, and any projects, code or lab work you can show</li><li>How you reason through an unfamiliar problem in the task</li><li>Reliability: availability for the full duration and weekly commitments</li></ul></Reveal>
            <Reveal index={1} className="duo-card"><h3>What to prepare</h3><ul className="checks checks--ink"><li>A statement of purpose of 150–300 words</li><li>Your latest marksheet or transcript (requested after screening)</li><li>Links to a portfolio, GitHub or project, if you have one</li><li>For dissertations: your institution’s project-permission letter, if required</li></ul></Reveal>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="fees-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Fees</p><h2 id="fees-h">Transparent internship fees</h2></div><Link to="/vedicgen/pricing" className="button button--secondary">All fees <I.Arrow /></Link></Reveal>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)"><table className="ptable">
            <thead><tr><th scope="col">Track</th><th scope="col">Mode</th><th scope="col">Durations</th><th scope="col">From</th></tr></thead>
            <tbody>{INTERNSHIPS.map((x) => <tr key={x.slug}><th scope="row"><Link to={`/vedicgen/internships/${x.slug}`} className="ulink">{x.title}</Link></th><td>{x.mode}</td><td>{x.options.map((o) => o.label.replace(' (dissertation length)', '')).join(' · ')}</td><td>{internshipFrom(x) ? `${inr(internshipFrom(x))} + GST` : 'No fee (selective)'}</td></tr>)}</tbody>
          </table></div>
          <p className="small subtle" style={{ marginTop: 12 }}>Fees are in INR and exclusive of 18% GST. {INTAKES.next ? `Next intake: ${INTAKES.next}.` : 'Applications are reviewed on a rolling basis; start dates are offered monthly.'}</p>
        </div>
      </section>

      <section className="section section--alt" id="apply" aria-labelledby="apply-h">
        <div className="container split-4-8 align-start">
          <div className="rail-head"><p className="kicker kicker--vg">Apply</p><h2 id="apply-h">Apply for an internship</h2><p className="muted">Choose a track and duration and tell us about yourself. You will hear from us within five working days.</p><p className="small subtle">Questions: <a className="ulink" href={`mailto:${BRAND.emails.help}`}>{BRAND.emails.help}</a></p></div>
          <Reveal className="form-card"><ApplicationForm kind="Internship application" options={INTERNSHIPS.map((x) => x.title)} durations={[...new Set(INTERNSHIPS.flatMap((x) => x.options.map((o) => o.label)))]} /></Reveal>
        </div>
      </section>
      <FaqSection items={HUB_FAQ} />
    </>
  );
}

export function InternshipDetail() {
  const { slug = '' } = useParams();
  const x = internshipBySlug(slug);
  if (!x) return <NotFound />;
  const fig = FIGURES[x.figure];
  const wet = x.discipline === 'wet';
  const others = INTERNSHIPS.filter((o) => o.slug !== x.slug && (o.discipline === x.discipline || o.discipline === 'hybrid')).slice(0, 3);
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Vedicgen', path: '/vedicgen' }, { name: 'Internships', path: '/vedicgen/internships' }, { name: x.title, path: `/vedicgen/internships/${x.slug}` }]}
        label={<><I.Pin width={14} height={14} /> {x.mode}</>} title={x.title} lede={x.intro}
        meta={<><DiscBadge d={x.discipline} /><span><I.Clock width={15} height={15} />{x.options.map((o) => o.weeks).filter((v, i, a) => a.indexOf(v) === i).join(', ')} weeks · {x.weekly}</span><span><I.Award width={15} height={15} />Certificate with verification ID</span></>}
        actions={<><a href="#apply" onClick={jump('apply')} className="button button--accent button--lg">Apply now <I.Arrow /></a><a href="#fees" onClick={jump('fees')} className="button button--secondary button--lg">Duration & fees</a></>}
        aside={<Figure caption={fig.caption}><fig.C /></Figure>} />

      <section className="section">
        <div className="container split-8-4 align-start">
          <div>
            <section className="block" aria-labelledby="about-h"><h2 id="about-h">About this internship</h2><div className="prose">{x.about.map((p) => <p key={p.slice(0, 30)}>{p}</p>)}</div>
              <p className="label" style={{ marginTop: 28, display: 'flex' }}>Example projects</p>
              <div className="cgrid" style={{ ['--cols' as string]: 2, marginTop: 12 }}>{x.projects.map((p, i) => <div key={p} className="proj"><span className="proj-n">{String(i + 1).padStart(2, '0')}</span><p>{p}</p></div>)}</div>
            </section>
            <section className="block" aria-labelledby="elig-h"><h2 id="elig-h">Eligibility</h2><ul className="checks checks--ink">{x.eligibility.map((e) => <li key={e}>{e}</li>)}</ul></section>
            <section className="block" aria-labelledby="sel-h"><h2 id="sel-h">Selection criteria</h2><ol className="numbered">{x.selection.map((s) => <li key={s}><span>{s}</span></li>)}</ol></section>
            <section className="block" aria-labelledby="proc-h"><h2 id="proc-h">Application procedure</h2><ol className="timeline">{INTERN_PROCESS.map((p) => <li key={p.t}><h3>{p.t}</h3><p>{p.d}</p></li>)}</ol></section>
            <section className="block" id="fees" aria-labelledby="fees-h"><h2 id="fees-h">Duration and fees</h2><FeeTable x={x} /><p className="small subtle" style={{ marginTop: 12 }}>Time commitment: {x.weekly}. Start dates are offered monthly and confirmed in your offer letter. Fees are payable after selection; see the <Link to="/refund-policy" className="ulink">refund policy</Link>.</p></section>
            <section className="block" aria-labelledby="out-h"><h2 id="out-h">Learning outcomes</h2><ol className="numbered numbered--2">{x.outcomes.map((o) => <li key={o}><span>{o}</span></li>)}</ol></section>
            <section className="block" aria-labelledby="men-h"><h2 id="men-h">Mentorship</h2><ul className="checks">{x.mentorship.map((m) => <li key={m}>{m}</li>)}</ul></section>
            <section className="block" aria-labelledby="del-h"><h2 id="del-h">Deliverables</h2><ul className="checks checks--ink">{x.deliverables.map((m) => <li key={m}>{m}</li>)}</ul>
              <div className="stack-sm" style={{ marginTop: 28 }}><p className="label">{wet ? 'Equipment and tools' : 'Tools you will use'}</p><div className="tagcloud">{x.tools.map((t) => <span key={t}>{t}</span>)}</div></div>
            </section>
            <section className="block" id="apply" aria-labelledby="apply-h"><h2 id="apply-h">Apply for this internship</h2>
              <div className="form-card"><ApplicationForm kind="Internship application" programme={x.title} options={[x.title]} durations={x.options.map((o) => `${o.label}${o.fee ? ` (${inr(o.fee)} + GST)` : ''}`)} wet={wet} /></div>
            </section>
          </div>
          <aside className="course-aside only-lg" aria-label="Summary">
            <div className="enrol">
              <span className="status status--open">Applications open</span>
              <div><div className="price">{internshipFrom(x) ? <>{inr(internshipFrom(x))} <small>+ GST</small></> : 'No fee'}</div><p className="small subtle" style={{ marginTop: 6 }}>{internshipFrom(x) ? `from, for ${x.options[0].label}` : 'Selective; limited places'}</p></div>
              <dl className="kv"><div><dt>Mode</dt><dd>{x.mode}</dd></div><div><dt>Durations</dt><dd>{x.options.map((o) => `${o.weeks} wk`).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</dd></div><div><dt>Commitment</dt><dd>{x.weekly}</dd></div><div><dt>Certificate</dt><dd>Verifiable ID</dd></div></dl>
              <a href="#apply" onClick={jump('apply')} className="button button--accent button--block">Apply now <I.Arrow /></a>
              <p className="xsmall subtle">Reply within five working days · <a className="ulink" href={`mailto:${BRAND.emails.help}`}>{BRAND.emails.help}</a></p>
            </div>
            {x.courses.length > 0 && <div className="stack-sm"><p className="label">Prepare with these courses</p>{x.courses.map((s) => { const c = courseBySlug(s); return c ? <CourseRowCompact key={s} c={c} /> : null; })}</div>}
          </aside>
        </div>
      </section>
      <FaqSection items={x.faq} alt />
      <section className="section" aria-labelledby="other-h"><div className="container"><Reveal className="band-head"><div><p className="kicker kicker--vg">Other tracks</p><h2 id="other-h">You may also like</h2></div><Link to="/vedicgen/internships" className="button button--secondary">All internships <I.Arrow /></Link></Reveal><div className="cgrid">{others.map((o, i) => <InternshipCard key={o.slug} x={o} index={i} />)}</div></div></section>
    </>
  );
}
