import { BRAND } from '@/core/brand';
import { durationOf, FORMAT_SHORT, GST, inr, SCHOOLS, TIER_FEES, TIER_USD, withGst } from '../../data/course-types';
import { INTERN_PROCESS } from '../../data/labels';
import { COURSES, feeOf, INTERNSHIPS } from '../../data/lite';
import { PROGRAMS, programListPrice } from '../../data/programs';
import { INSTITUTIONAL, RESEARCH_TRAINING, WORKSHOPS } from '../../data/training';
import { ApplicationForm } from '../../Form';
import { I } from '../../icons';
import { Link } from '../../Link';
import { Accordion, FaqSection, jump, PageHeader, Reveal } from '../../primitives';

const PRICE_FAQ = [
  { q: 'Do the fees include GST?', a: `No. Fees are shown exclusive of Goods and Services Tax, which is charged at ${Math.round(GST * 100)}% as required by law and shown on your invoice. Totals including GST are listed alongside.` },
  { q: 'How do I pay?', a: 'After your application is accepted, you receive an admission offer with a secure online payment link (UPI, debit and credit cards, net banking). Your place is confirmed on payment. We never ask for card details by e-mail or phone.' },
  { q: 'Can I pay in instalments?', a: 'Yes, for fees above ₹15,000: programmes and longer internships can be paid in up to three instalments. Ask for an instalment plan when you apply.' },
  { q: 'Are there group or institutional discounts?', a: 'Groups of five or more learners from the same institution receive 10% off course fees. Departments booking private cohorts, workshops or certificate courses are quoted per participant; see the institutions page.' },
  { q: 'Can international learners join?', a: 'Yes. Online courses can be paid in US dollars at the international fees shown. In-person wet-lab courses are priced in INR for all participants.' },
  { q: 'What if I need to cancel?', a: 'See the refund and cancellation policy: full refund up to 7 days before the start, transfers to a later cohort, and pro-rata refunds in specific cases.' },
];

export function Pricing() {
  const tiers = [['foundation', 'Foundation (beginner)'], ['core', 'Core (intermediate)'], ['advanced', 'Advanced']] as const;
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Vedicgen', path: '/vedicgen' }, { name: 'Fees & pricing', path: '/vedicgen/pricing' }]} label="Solagene Vedicgen · Fees" title="Transparent fees for every programme"
        lede="Every Vedicgen fee is published: online courses by level and format, wet-lab bench courses individually, programmes, internships, workshops, research training and institutional rates. All amounts in INR, exclusive of 18% GST."
        actions={<><a href="#courses" onClick={jump('courses')} className="button button--accent button--lg">Course fees <I.Arrow /></a><a href="#internships" onClick={jump('internships')} className="button button--secondary button--lg">Internship fees</a></>} />

      <section className="section" id="courses" aria-labelledby="tiers-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Online courses</p><h2 id="tiers-h">Bioinformatics and computing courses</h2></div><p className="lede">Dry-lab courses are priced by level. Live cohorts include about 32 hours of instructor-led teaching and lab clinics over four weeks at most, and the schedule is customisable (intensive, standard or weekends only); self-paced courses include six months of access and mentor review of your project.</p></Reveal>
          <div className="price-cards">
            {tiers.map(([k, t], i) => (
              <Reveal key={k} index={i} className={`price-card ${k === 'core' ? 'is-feat' : ''}`}>
                {k === 'core' && <span className="price-flag">Most courses</span>}
                <p className="label">{t}</p>
                <div className="price-row"><span>Live online cohort</span><b>{inr(TIER_FEES[k].live!)}</b><small>{inr(withGst(TIER_FEES[k].live!))} incl. GST · US${TIER_USD[k].live}</small></div>
                <div className="price-row"><span>Self-paced</span><b>{inr(TIER_FEES[k]['self-paced']!)}</b><small>{inr(withGst(TIER_FEES[k]['self-paced']!))} incl. GST · US${TIER_USD[k]['self-paced']}</small></div>
                <p className="small subtle">{COURSES.filter((c) => c.discipline === 'dry' && c.tier === k && !c.customFee).length} courses at this level</p>
              </Reveal>
            ))}
          </div>
          <p className="small subtle" style={{ marginTop: 14 }}>Life-science foundation courses: live {inr(4999)}, self-paced {inr(2499)}; research methodology and biostatistics courses are listed below. Fees were set after reviewing the published fees of comparable programmes in India and abroad (October 2026).</p>

          <h3 className="sub-h">Every course and its fee</h3>
          <Accordion defaultOpen={[]} items={SCHOOLS.map((s) => ({ q: <>{s.name} <span className="small subtle">· {COURSES.filter((c) => c.school === s.id).length} courses</span></>, a: (
            <div className="table-wrap" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)"><table className="ptable">
              <thead><tr><th scope="col">Course</th><th scope="col">Format</th><th scope="col">Duration</th><th scope="col">Fee (+ GST)</th></tr></thead>
              <tbody>{COURSES.filter((c) => c.school === s.id).flatMap((c) => c.formats.map((f, j) => <tr key={c.slug + f}>{j === 0 ? <th scope="row" rowSpan={c.formats.length}><Link to={`/vedicgen/courses/${c.slug}`} className="ulink">{c.title}</Link></th> : null}<td>{FORMAT_SHORT[f]}</td><td>{durationOf(c, f)}</td><td className="num">{inr(feeOf(c, f)!)}</td></tr>))}</tbody>
            </table></div>
          ) }))} />
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="wet-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Wet lab</p><h2 id="wet-h">Bench courses in our laboratory</h2></div><p className="lede">Priced individually because reagents and consumables differ. Fees include all reagents, kits, consumables, protective equipment, the lab manual and the certificate.</p></Reveal>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)"><table className="ptable">
            <thead><tr><th scope="col">Course</th><th scope="col">Length</th><th scope="col">Fee</th><th scope="col">Incl. GST</th></tr></thead>
            <tbody>{COURSES.filter((c) => c.formats.includes('in-person')).map((c) => <tr key={c.slug}><th scope="row"><Link to={`/vedicgen/courses/${c.slug}`} className="ulink">{c.title}</Link></th><td>{c.days} days · {c.hours} h</td><td className="num">{inr(feeOf(c, 'in-person')!)}</td><td>{inr(withGst(feeOf(c, 'in-person')!))}</td></tr>)}</tbody>
          </table></div>
        </div>
      </section>

      <section className="section" aria-labelledby="prog-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Programmes</p><h2 id="prog-h">Professional programmes</h2></div><Link to="/vedicgen/programs" className="button button--secondary">All programmes <I.Arrow /></Link></Reveal>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)"><table className="ptable">
            <thead><tr><th scope="col">Programme</th><th scope="col">Length</th><th scope="col">Courses separately</th><th scope="col">Programme fee</th></tr></thead>
            <tbody>{PROGRAMS.map((p) => <tr key={p.slug}><th scope="row"><Link to={`/vedicgen/programs/${p.slug}`} className="ulink">{p.title}</Link></th><td>~{p.months} months, flexible</td><td><s>{inr(programListPrice(p))}</s></td><td className="num">{inr(p.fee)}</td></tr>)}</tbody>
          </table></div>
        </div>
      </section>

      <section className="section section--alt" id="internships" aria-labelledby="int-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Internships</p><h2 id="int-h">Internship fees by duration</h2></div><Link to="/vedicgen/internships" className="button button--secondary">All internships <I.Arrow /></Link></Reveal>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)"><table className="ptable">
            <thead><tr><th scope="col">Track</th>{['4 wk', '8 wk', '12 wk', '24 wk'].map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>{INTERNSHIPS.map((x) => <tr key={x.slug}><th scope="row"><Link to={`/vedicgen/internships/${x.slug}`} className="ulink">{x.title}</Link></th>{[4, 8, 12, 24].map((w) => { const os = x.options.filter((o) => o.weeks === w); return <td key={w} className={os.length ? 'num' : undefined}>{os.length ? os.map((o) => (o.fee ? inr(o.fee) : 'No fee')).join(' / ') : '—'}</td>; })}</tr>)}</tbody>
          </table></div>
          <p className="small subtle" style={{ marginTop: 12 }}>Where a track has dry- and wet-lab options for the same length, both fees are shown (dry / wet). Summer internships also run for 6 weeks: dry lab {inr(9999)}, wet lab {inr(19999)}.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="ws-h">
        <div className="container col2 align-start">
          <Reveal className="stack-md"><p className="kicker kicker--vg">Workshops</p><h2 id="ws-h" style={{ fontSize: 'clamp(1.5rem, 1.2rem + 0.8vw, 2rem)' }}>Short workshops</h2>
            <div className="table-wrap" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)"><table className="ptable" style={{ minWidth: 0 }}><tbody>{WORKSHOPS.map((w) => <tr key={w.slug}><th scope="row">{w.title}<br /><span className="small subtle">{w.mode} · {w.duration}</span></th><td className="num">{inr(w.fee)}{w.feePro ? <><br /><span className="small subtle">{inr(w.feePro)} professionals</span></> : null}</td></tr>)}</tbody></table></div>
          </Reveal>
          <Reveal index={1} className="stack-md"><p className="kicker kicker--vg">Research training & institutions</p><h2 style={{ fontSize: 'clamp(1.5rem, 1.2rem + 0.8vw, 2rem)' }}>Research training</h2>
            <div className="table-wrap" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)"><table className="ptable" style={{ minWidth: 0 }}><tbody>{RESEARCH_TRAINING.map((r) => <tr key={r.slug}><th scope="row">{r.title}<br /><span className="small subtle">{r.duration}</span></th><td>{r.fee}</td></tr>)}</tbody></table></div>
            <h3 className="sub-h" style={{ marginTop: 8 }}>Institutional rates (indicative)</h3>
            <div className="table-wrap" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)"><table className="ptable" style={{ minWidth: 0 }}><tbody>{INSTITUTIONAL.map((r) => <tr key={r.slug}><th scope="row">{r.title}</th><td>{r.indicative}</td></tr>)}</tbody></table></div>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="pol-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Policies</p><h2 id="pol-h">Payment, discounts and refunds</h2></div></Reveal>
          <div className="cgrid" style={{ ['--cols' as string]: 4 }}>
            {[[I.Shield, 'Secure payment', 'Pay through a secure link sent with your admission offer. We never take card details by phone or e-mail.'], [I.Layers, 'Instalments', 'Up to three instalments for fees above ₹15,000, on request.'], [I.Users, 'Group discount', '10% off course fees for five or more learners from the same institution.'], [I.ArrowLeft, 'Refunds', 'Full refund up to 7 days before the start; transfers to a later cohort.']].map(([Ic, t, d], i) => { const C = Ic as typeof I.Shield; return <Reveal key={t as string} index={i} className="ccard-wrap"><div className="ccard"><span className="icon-tile"><C width={20} height={20} /></span><h3>{t as string}</h3><p>{d as string}</p></div></Reveal>; })}
          </div>
          <p style={{ marginTop: 20 }}><Link to="/refund-policy" className="textlink">Read the full refund and cancellation policy <I.Arrow width={15} height={15} /></Link></p>
        </div>
      </section>
      <FaqSection items={PRICE_FAQ} />
    </>
  );
}

const APPLY_FAQ = [
  { q: 'Is there an application fee?', a: 'No. Applying is free. You pay only after you accept an admission offer.' },
  { q: 'What documents will I need?', a: 'None to apply. After review we may ask for your latest marksheet or transcript and, for dissertations, your institution’s project-permission letter. Wet-lab participants sign a safety declaration on day one.' },
  { q: 'How long does it take to hear back?', a: 'Two working days for courses and programmes, five for internships. If you have not heard from us, check your spam folder or write to help@solagene.com.' },
  { q: 'Can I apply for more than one programme?', a: 'Yes. Mention all of them in your goals and an adviser will suggest a sensible order.' },
];

export function Apply() {
  const groups = [
    ...SCHOOLS.map((s) => ({ label: s.name, options: COURSES.filter((c) => c.school === s.id).map((c) => c.title) })),
    { label: 'Professional programmes', options: PROGRAMS.map((p) => p.title) },
    { label: 'Internships', options: INTERNSHIPS.map((x) => x.title) },
    { label: 'Research training', options: RESEARCH_TRAINING.map((r) => r.title) },
    { label: 'Workshops', options: WORKSHOPS.map((w) => w.title) },
    { label: 'Not sure yet', options: ['Please advise me'] },
  ];
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Vedicgen', path: '/vedicgen' }, { name: 'Apply', path: '/vedicgen/apply' }]} label="Solagene Vedicgen · Admissions" title="Apply to Vedicgen"
        lede="One application for any course, programme, internship, workshop or research training. Applying is free; an admissions adviser replies within two working days (five for internships)."
        actions={<a href="#form" onClick={jump('form')} className="button button--accent button--lg">Start your application <I.Arrow /></a>} />
      <section className="section" aria-labelledby="how-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">How admission works</p><h2 id="how-h">From application to first session</h2></div></Reveal>
          <ol className="steps" style={{ ['--n' as string]: 5 }}>
            <li><h3>Apply online</h3><p>Tell us about your education, experience and goals. About ten minutes.</p></li>
            <li><h3>Review</h3><p>An adviser checks eligibility and fit and suggests the right format or level.</p></li>
            <li><h3>Interview (internships)</h3><p>A short task and a 20-minute online conversation for internship tracks.</p></li>
            <li><h3>Offer and payment</h3><p>Dates, timetable, fee and a secure payment link. Your place is confirmed on payment.</p></li>
            <li><h3>Onboarding</h3><p>Joining instructions, set-up guide or laboratory safety briefing.</p></li>
          </ol>
        </div>
      </section>
      <section className="section section--alt" id="form" aria-labelledby="form-h">
        <div className="container split-4-8 align-start">
          <div className="rail-head">
            <p className="kicker kicker--vg">Application form</p><h2 id="form-h">Your application</h2>
            <p className="muted">Fields marked optional can be skipped. Everything you share is used only to process your application.</p>
            <div className="stack-sm" style={{ marginTop: 12 }}><p className="label">Selection criteria</p><ul className="checks small"><li>Eligibility for the programme</li><li>Relevant coursework and experience</li><li>Clarity of goals</li><li>For internships: task and interview</li></ul></div>
            <p className="small subtle" style={{ marginTop: 12 }}>Prefer e-mail? <a className="ulink" href={`mailto:${BRAND.emails.help}`}>{BRAND.emails.help}</a></p>
          </div>
          <Reveal className="form-card"><ApplicationForm kind="Application" groups={groups} formats={['Live online', 'Self-paced online', 'In person (laboratory)', 'Not sure']} minSop={60} /></Reveal>
        </div>
      </section>
      <section className="section" aria-labelledby="int-proc-h"><div className="container"><Reveal className="band-head"><div><p className="kicker kicker--vg">Internship selection</p><h2 id="int-proc-h">Applying for an internship?</h2></div><Link to="/vedicgen/internships" className="button button--secondary">Internship tracks <I.Arrow /></Link></Reveal><ol className="steps" style={{ ['--n' as string]: INTERN_PROCESS.length }}>{INTERN_PROCESS.map((p) => <li key={p.t}><h3>{p.t}</h3><p>{p.d}</p></li>)}</ol></div></section>
      <FaqSection items={APPLY_FAQ} alt />
    </>
  );
}
