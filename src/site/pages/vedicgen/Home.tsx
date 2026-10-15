import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND, DIVISIONS } from '@/core/brand';
import { inr, SCHOOLS, TIER_FEES } from '../../data/course-types';
import { INTERN_PROCESS } from '../../data/labels';
import { COURSES, INTERNSHIPS } from '../../data/lite';
import { PROGRAMS } from '../../data/programs';
import { INSTITUTIONAL, RESEARCH_TRAINING, WORKSHOPS } from '../../data/training';
import { I } from '../../icons';
import { Link } from '../../Link';
import { FaqSection, Reveal } from '../../primitives';
import { CountUp, CourseCard, InternshipCard, ProgramCard, SCHOOL_ICON } from '../../ui';

const FAQ = [
  { q: 'What is Vedicgen?', a: `Vedicgen is the school of ${BRAND.name}: its education sub-brand for courses, programmes, internships, workshops and research training in biotechnology, bioinformatics, scientific computing and the life sciences.` },
  { q: 'Where do the wet-lab courses take place?', a: `Bench courses and wet-lab internships are held in person at our laboratory. The laboratory address and joining instructions are sent with your admission letter.` },
  { q: 'Can I study online?', a: 'Yes. All bioinformatics, computing and life-science courses are offered as live online cohorts and most also as self-paced courses with mentor-reviewed projects.' },
  { q: 'How do I apply and when will I hear back?', a: 'Apply online from any course or internship page, or from the Apply page. Course applications are reviewed within two working days and internship applications within five; you receive an admission offer with dates and a secure payment link.' },
  { q: 'Are fees fixed and published?', a: 'Yes. Every fee is shown on the course page and the pricing page, in INR and exclusive of 18% GST. International learners can pay in USD for online courses.' },
  { q: 'Is the certificate recognised?', a: 'Vedicgen certificates are issued by Vivofold, a private company, and carry a unique verification ID. They document skills and hours; they are not university degrees. Many universities accept internships for credit; check your institution’s rules.' },
];

function Search() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  return (
    <form className="big-search" role="search" onSubmit={(e) => { e.preventDefault(); nav(`/vedicgen/courses/?q=${encodeURIComponent(q.trim())}`); }}>
      <I.Search width={20} height={20} />
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 73 courses: RNA-seq, PCR, docking, Python, cloud…" aria-label="Search courses" />
      <button type="submit" className="button button--accent">Search</button>
    </form>
  );
}

export default function VedicgenHome() {
  const wet = COURSES.filter((c) => c.discipline !== 'dry').length;
  return (
    <>
      <section className="dhero dhero--vg" aria-labelledby="vg-hero">
        <div className="container dhero-grid">
          <div className="dhero-copy">
            <p className="kicker kicker--vg">Vivofold Vedicgen · The school of Vivofold</p>
            <h1 id="vg-hero" className="t-display" style={{ fontSize: 'clamp(2.6rem, 1.6rem + 3.6vw, 4.6rem)' }}>From pipette <span className="grad-text">to pipeline.</span></h1>
            <p className="lede">{DIVISIONS.vedicgen.line} Learn at the bench in our laboratory, analyse data online with expert instructors, and leave with work you can show.</p>
            <Search />
            <div className="quick-chips">{[['RNA-seq', 'rna-seq-data-analysis'], ['PCR & gel', 'molecular-biology-techniques'], ['Molecular docking', 'molecular-docking-drug-discovery'], ['Cell culture', 'animal-cell-culture'], ['Python', 'python-for-bioinformatics'], ['Cloud', 'cloud-computing-for-bioinformatics'], ['GIS', 'gis-remote-sensing']].map(([t, s]) => <Link key={s} to={`/vedicgen/courses/${s}`}>{t}</Link>)}</div>
          </div>
          <Reveal className="gpanel" style={{ display: 'grid', gap: 18 }}>
            <p className="label">Vedicgen at a glance</p>
            <div className="stat-row" style={{ ['--n' as string]: 2 }}>
              <div><b><CountUp to={COURSES.length} /></b><span>courses in 4 schools</span></div>
              <div><b><CountUp to={wet} /></b><span>wet-lab & hybrid courses</span></div>
              <div><b><CountUp to={PROGRAMS.length} /></b><span>professional programmes</span></div>
              <div><b><CountUp to={INTERNSHIPS.length} /></b><span>internship tracks</span></div>
            </div>
            <ul className="checks checks--ink">
              <li>Live online cohorts from {inr(TIER_FEES.foundation.live!)} and self-paced from {inr(TIER_FEES.foundation['self-paced']!)} (+ GST)</li>
              <li>In-person bench training, every participant at the bench</li>
              <li>Published syllabus, fees and selection criteria for every programme</li>
              <li>Certificates with a unique ID anyone can verify</li>
            </ul>
            <div className="inline"><Link to="/vedicgen/apply" className="button button--accent">Apply now <I.Arrow /></Link><Link to="/vedicgen/pricing" className="button button--secondary">See all fees</Link></div>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="schools-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Four schools</p><h2 id="schools-h">Choose where to start.</h2></div><p className="lede">Each school has its own courses, learning paths and teaching format. Many learners combine two: bench skills with bioinformatics, or biology with computing.</p></Reveal>
          <div className="cgrid" style={{ ['--cols' as string]: 4 }}>
            {SCHOOLS.map((s, i) => { const Ic = SCHOOL_ICON[s.id]; const n = COURSES.filter((c) => c.school === s.id).length; return (
              <Reveal key={s.id} index={i} className="ccard-wrap"><Link to={`/vedicgen/courses?school=${s.id}`} className={`ccard ccard--${s.id}`} style={{ minHeight: 260 }}>
                <span className="icon-tile"><Ic width={22} height={22} /></span>
                <h3>{s.name}</h3>
                <p>{s.line}</p>
                <div className="ccard-foot"><span className="fee"><b>{n}</b><small> courses</small></span><span className="ccard-go">Explore <I.Arrow width={15} height={15} /></span></div>
              </Link></Reveal>
            ); })}
          </div>
        </div>
      </section>

      <section className="section section--grad" aria-labelledby="feat-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Popular now</p><h2 id="feat-h">Courses learners start with.</h2></div><Link to="/vedicgen/courses" className="button button--primary">Browse all {COURSES.length} courses <I.Arrow /></Link></Reveal>
          <div className="cgrid">{COURSES.filter((c) => c.featured).slice(0, 9).map((c, i) => <CourseCard key={c.slug} c={c} index={i} />)}</div>
        </div>
      </section>

      <section className="section" aria-labelledby="prog-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Professional programmes</p><h2 id="prog-h">A path, not a pile of courses.</h2><p className="lede">Programmes bundle courses in the right order with an integrated capstone, priced below the courses bought separately.</p></div><Link to="/vedicgen/programs" className="button button--secondary">All programmes <I.Arrow /></Link></Reveal>
          <div className="cgrid">{PROGRAMS.slice(0, 6).map((p, i) => <ProgramCard key={p.slug} p={p} index={i} />)}</div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="int-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Internships</p><h2 id="int-h">Mentored research experience, wet lab or dry lab.</h2></div><Link to="/vedicgen/internships" className="button button--primary">All {INTERNSHIPS.length} internship tracks <I.Arrow /></Link></Reveal>
          <div className="cgrid">{INTERNSHIPS.slice(0, 6).map((x, i) => <InternshipCard key={x.slug} x={x} index={i} />)}</div>
          <Reveal as="ol" className="steps" style={{ ['--n' as string]: INTERN_PROCESS.length, marginTop: 56 }}>{INTERN_PROCESS.map((p) => <li key={p.t}><h3>{p.t}</h3><p>{p.d}</p></li>)}</Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="more-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Beyond courses</p><h2 id="more-h">Workshops, research training and institutions.</h2></div></Reveal>
          <div className="cgrid">
            <Reveal className="ccard-wrap"><Link to="/vedicgen/workshops" className="ccard ccard--biotechnology"><span className="icon-tile"><I.Calendar width={22} height={22} /></span><h3>Workshops</h3><p>{WORKSHOPS.length} short, hands-on workshops online and in person, from {inr(Math.min(...WORKSHOPS.map((w) => w.fee)))}.</p><span className="ccard-go">See workshops <I.Arrow width={15} height={15} /></span></Link></Reveal>
            <Reveal index={1} className="ccard-wrap"><Link to="/vedicgen/research-training" className="ccard ccard--bioinformatics"><span className="icon-tile"><I.Microscope width={22} height={22} /></span><h3>Research training</h3><p>{RESEARCH_TRAINING.length} ways to build research skills: a bootcamp, mentored projects, one-to-one mentoring and thesis clinics.</p><span className="ccard-go">Research training <I.Arrow width={15} height={15} /></span></Link></Reveal>
            <Reveal index={2} className="ccard-wrap"><Link to="/vedicgen/institutions" className="ccard ccard--computing"><span className="icon-tile"><I.Building width={22} height={22} /></span><h3>For institutions</h3><p>{INSTITUTIONAL.length} programmes for colleges, universities and companies: workshops, FDPs, certificate courses and consulting.</p><span className="ccard-go">For institutions <I.Arrow width={15} height={15} /></span></Link></Reveal>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="cert-h">
        <div className="container split-5-7 align-center">
          <Reveal className="stack-md"><p className="kicker kicker--vg">Certificates</p><h2 id="cert-h">Proof anyone can check.</h2><p className="lede">Every Vedicgen certificate carries a unique ID and QR code. Employers and admissions offices can confirm it in seconds on our verification page.</p><div className="inline"><Link to="/verify" className="button button--secondary">Verify a certificate <I.Arrow /></Link></div></Reveal>
          <Reveal index={1}><div className="cert-card"><div className="cert-head"><span className="label">Certificate of completion</span><span className="tag tag--plain">Sample</span></div><b>Molecular Biology Techniques: DNA, RNA, PCR & Electrophoresis</b><span className="small subtle">Awarded to the learner named on the certificate · 30 hours of bench training</span><div className="cert-foot"><span className="mono xsmall">ID · VG-XXXX-XXXX</span><span className="small">Vivofold Vedicgen</span></div></div></Reveal>
        </div>
      </section>

      <FaqSection items={FAQ} />
      <section className="section section--tight"><div className="container"><Reveal className="cta-band cta-band--vg"><div><p className="kicker kicker--vg">Ready?</p><h2>Applications are open for all programmes.</h2><p>Tell us what you want to learn; an admissions adviser replies within two working days.</p></div><div className="inline"><Link to="/vedicgen/apply" className="button button--accent button--lg">Apply now <I.Arrow /></Link><a href={`mailto:${BRAND.emails.help}`} className="button button--secondary button--lg">{BRAND.emails.help}</a></div></Reveal></div></section>
    </>
  );
}
