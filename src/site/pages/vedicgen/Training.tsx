import { useState } from 'react';
import { BRAND } from '@/core/brand';
import { inr } from '../../data/course-types';
import { courseBySlug } from '../../data/lite';
import { INSTITUTIONAL, RESEARCH_TRAINING, WORKSHOPS } from '../../data/training';
import Form, { F, QUALIFICATIONS } from '../../Form';
import { I } from '../../icons';
import { Link } from '../../Link';
import { FaqSection, jump, PageHeader, Reveal } from '../../primitives';
import { DiscBadge } from '../../ui';

const crumbs = (name: string, path: string) => [{ name: 'Home', path: '/' }, { name: 'Vedicgen', path: '/vedicgen' }, { name, path }];

export function Workshops() {
  const [mode, setMode] = useState<'all' | 'Online' | 'In person'>('all');
  const [pick, setPick] = useState('');
  const list = WORKSHOPS.filter((w) => mode === 'all' || w.mode === mode);
  return (
    <>
      <PageHeader crumbs={crumbs('Workshops', '/vedicgen/workshops')} label="Vivofold Vedicgen · Workshops" title="Bioinformatics and biotechnology workshops, online and in person"
        lede={`${WORKSHOPS.length} workshops of one or two days: online for computational topics, in person for bench techniques. A fast way to learn one method well, with a certificate of participation.`}
        actions={<a href="#register" onClick={jump('register')} className="button button--accent button--lg">Register interest <I.Arrow /></a>} />
      <section className="section">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Workshops</p><h2>{list.length} workshops</h2></div><div className="seg" role="group" aria-label="Mode">{(['all', 'Online', 'In person'] as const).map((m) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>{m === 'all' ? 'All' : m === 'Online' ? 'Online' : 'In person'}</button>)}</div></Reveal>
          <div className="cgrid" key={mode}>
            {list.map((w, i) => { const c = courseBySlug(w.course); return (
              <Reveal key={w.slug} index={i} className="ccard-wrap" id={w.slug}><div className={`ccard ccard--${w.discipline === 'wet' ? 'biotechnology' : 'bioinformatics'}`}>
                <div className="ccard-top"><span className="ccard-school">{w.mode === 'Online' ? <I.Monitor width={14} height={14} /> : <I.Pin width={14} height={14} />}{w.mode}</span><DiscBadge d={w.discipline} /></div>
                <h3>{w.title}</h3>
                <ul className="dashes small">{w.topics.map((t) => <li key={t}>{t}</li>)}</ul>
                <p className="small"><b>You will:</b> {w.outcome}</p>
                <div className="ccard-meta"><span><I.Clock width={13} height={13} />{w.duration} · {w.hours} h</span>{c && <Link to={`/vedicgen/courses/${c.slug}`} className="ulink">Full course</Link>}</div>
                <div className="ccard-foot"><span className="fee"><b>{inr(w.fee)}</b><small> {w.feePro ? 'students' : '+ GST'}</small>{w.feePro && <small style={{ marginLeft: 6 }}>· {inr(w.feePro)} professionals</small>}</span><a href="#register" className="ccard-go" onClick={(e) => { jump('register')(e); setPick(w.title); }}>Register <I.Arrow width={15} height={15} /></a></div>
              </div></Reveal>
            ); })}
          </div>
          <p className="small subtle" style={{ marginTop: 14 }}>Fees exclude 18% GST. Workshop dates are announced to registered participants; register interest and we will e-mail you the next date for your workshop.</p>
        </div>
      </section>
      <section className="section section--alt" id="register" aria-labelledby="reg-h">
        <div className="container split-4-8 align-start">
          <div className="rail-head"><p className="kicker kicker--vg">Register</p><h2 id="reg-h">Register for a workshop</h2><p className="muted">We confirm the next date, joining details and payment link by e-mail.</p></div>
          <Reveal className="form-card"><Form key={pick} kind="Workshop registration" inbox="help" initial={{ workshop: pick }} subject={(v) => `[Workshop] ${v.workshop}: ${v.name}`} submitLabel="Register interest" doneTitle="Thank you. You are on the list."
            done="We will e-mail you the next date, timetable and payment link for your workshop."
            fields={[F.name, F.email, F.phoneReq, { name: 'institution', label: 'Institution or organisation', required: true, half: true }, { name: 'workshop', label: 'Workshop', type: 'select', required: true, options: WORKSHOPS.map((w) => w.title) }, { name: 'participant', label: 'I am a', type: 'select', required: true, options: ['Student', 'Research scholar', 'Faculty member', 'Industry professional'], half: true }, { name: 'qualification', label: 'Highest qualification', type: 'select', options: QUALIFICATIONS, half: true }, F.message('Anything we should know?', 'Questions, preferred dates or a group booking.', false), F.consent]} /></Reveal>
        </div>
      </section>
      <FaqSection items={[{ q: 'Do I get a certificate?', a: 'Yes, a Vedicgen certificate of participation with a verification ID.' }, { q: 'Can my college host a workshop?', a: 'Yes. Any workshop can run on your campus or online for your students. See the institutions page.' }, { q: 'Do online workshops need software installed?', a: 'Most use free web tools or the Nayancode Workbench in the browser; set-up instructions are sent beforehand when software is needed.' }]} />
    </>
  );
}

export function ResearchTraining() {
  return (
    <>
      <PageHeader crumbs={crumbs('Research training', '/vedicgen/research-training')} label="Vivofold Vedicgen · Research training" title="Research training and mentoring"
        lede="Build research skills with people who do research: an intensive bootcamp, supervised projects, one-to-one mentoring and small-group thesis clinics. We guide your work; we never write it for you." />
      <section className="section">
        <div className="container">
          <div className="rt-list">
            {RESEARCH_TRAINING.map((r, i) => (
              <Reveal key={r.slug} index={i} className="rt-item" id={r.slug}>
                <div className="rt-main"><span className="label">{r.format} · {r.duration}</span><h2>{r.title}</h2><p className="lede">{r.body}</p><p className="small"><b>For:</b> {r.who}</p></div>
                <div className="rt-side"><div className="fee"><b>{r.fee.split(' · ')[0]}</b></div>{r.fee.includes(' · ') && <p className="small subtle">{r.fee.split(' · ').slice(1).join(' · ')}</p>}<ul className="checks small">{r.includes.map((x) => <li key={x}>{x}</li>)}</ul><a href="#enquire" onClick={jump('enquire')} className="button button--accent button--sm">Enquire <I.Arrow width={15} height={15} /></a></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section section--alt" id="enquire" aria-labelledby="enq-h">
        <div className="container split-4-8 align-start">
          <div className="rail-head"><p className="kicker kicker--vg">Enquire</p><h2 id="enq-h">Tell us about your research</h2><p className="muted">A research adviser replies within two working days with a plan and fee.</p></div>
          <Reveal className="form-card"><Form kind="Research training enquiry" inbox="help" subject={(v) => `[Research training] ${v.programme}: ${v.name}`} submitLabel="Send enquiry" doneTitle="Thank you. Your enquiry has been sent."
            fields={[F.name, F.email, F.phoneReq, { name: 'institution', label: 'Institution', required: true, half: true }, { name: 'programme', label: 'Programme', type: 'select', required: true, options: RESEARCH_TRAINING.map((r) => r.title) }, { name: 'stage', label: 'Your stage', type: 'select', required: true, options: ['Master’s student', 'PhD student', 'Postdoc', 'Faculty', 'Industry researcher', 'Graduate preparing for a PhD'], half: true }, { name: 'area', label: 'Research area', required: true, half: true, placeholder: 'e.g. cancer transcriptomics' }, F.message('What do you need help with?', 'Your project, data and what you want to achieve.'), F.consent]} /></Reveal>
        </div>
      </section>
    </>
  );
}

export function Institutions() {
  return (
    <>
      <PageHeader crumbs={crumbs('For institutions', '/vedicgen/institutions')} label="Vivofold Vedicgen · For institutions" title="Training for colleges, universities and companies"
        lede="Campus workshops, faculty development programmes, semester-long certificate courses, curriculum and lab consulting, and private cohorts for industry teams, designed around your students, your syllabus and your facilities."
        actions={<a href="#enquire" onClick={jump('enquire')} className="button button--accent button--lg">Plan a programme <I.Arrow /></a>} />
      <section className="section">
        <div className="container stack-lg">
          {INSTITUTIONAL.map((o, i) => (
            <Reveal key={o.slug} index={i} className="inst" id={o.slug}>
              <div className="inst-n">{String(i + 1).padStart(2, '0')}</div>
              <div className="stack-sm"><h2>{o.title}</h2><p className="lede">{o.body}</p><div className="tagcloud">{o.formats.map((f) => <span key={f}>{f}</span>)}</div></div>
              <div className="inst-side"><p className="label">Indicative fees</p><p className="small">{o.indicative}</p><p className="label" style={{ marginTop: 14 }}>Examples</p><ul className="dashes small">{o.examples.map((e) => <li key={e}>{e}</li>)}</ul></div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section section--grad" aria-labelledby="why-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Why Vedicgen</p><h2 id="why-h">Built to fit an academic calendar</h2></div></Reveal>
          <div className="cgrid" style={{ ['--cols' as string]: 4 }}>
            {[[I.Clipboard, 'Aligned to your syllabus', 'Programmes mapped to your courses and assessment rules.'], [I.Monitor, 'No installation needed', 'Dry-lab sessions can run on the free Nayancode Workbench in any browser.'], [I.Award, 'Verifiable certificates', 'Attendance records and certificates with unique IDs for every participant.'], [I.Flask, 'Wet-lab options', 'Bench training on your campus or at our laboratory.']].map(([Ic, t, d], i) => { const C = Ic as typeof I.Award; return <Reveal key={t as string} index={i} className="ccard-wrap"><div className="ccard"><span className="icon-tile"><C width={20} height={20} /></span><h3>{t as string}</h3><p>{d as string}</p></div></Reveal>; })}
          </div>
        </div>
      </section>
      <section className="section" id="enquire" aria-labelledby="enq-h">
        <div className="container split-4-8 align-start">
          <div className="rail-head"><p className="kicker kicker--vg">Enquire</p><h2 id="enq-h">Plan a programme for your institution</h2><p className="muted">We reply within two working days with a proposal and a quote. MoUs are welcome.</p><p className="small subtle"><a className="ulink" href={`mailto:${BRAND.emails.help}`}>{BRAND.emails.help}</a></p></div>
          <Reveal className="form-card"><Form kind="Institutional enquiry" inbox="help" subject={(v) => `[Institution] ${v.institution}: ${v.offer}`} submitLabel="Request a proposal" doneTitle="Thank you. We will send a proposal."
            fields={[F.name, { name: 'designation', label: 'Designation', required: true, half: true, placeholder: 'e.g. Head of Department' }, { name: 'institution', label: 'Institution or company', required: true, half: true }, { name: 'city', label: 'City', required: true, half: true }, F.email, F.phoneReq, { name: 'offer', label: 'Programme type', type: 'select', required: true, options: INSTITUTIONAL.map((o) => o.title) }, { name: 'participants', label: 'Expected participants', type: 'select', required: true, half: true, options: ['Up to 30', '31–60', '61–120', 'More than 120'] }, { name: 'mode', label: 'Preferred mode', type: 'select', half: true, options: ['Online', 'On our campus', 'At the Vivofold laboratory', 'Not sure'] }, F.message('Topics and dates', 'Subjects, audience (UG/PG/faculty), preferred dates and anything else.'), F.consent]} /></Reveal>
        </div>
      </section>
    </>
  );
}
