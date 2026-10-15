import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BRAND, TEAM } from '@/core/brand';
import { batchOf, COURSES, courseBySlug, DISCIPLINE_LABEL, durationOf, durationShort, FLEX_NOTE, WET_FLEX_NOTE, feeOf, FORMAT_LABEL, FORMAT_NOTE, GST, inr, PROGRAMS, schoolOf, usdOf, withGst, type Format } from '../../data/courses';
import { Figure, FIGURES } from '../../figures';
import { ApplicationForm } from '../../Form';
import { I } from '../../icons';
import { Link } from '../../Link';
import { Accordion, jump, PageHeader, Reveal, useScrollSpy } from '../../primitives';
import { liteCourse } from '../../data/lite';
import { CourseCard, DiscBadge, ProgramCard, SCHOOL_ICON } from '../../ui';
import NotFound from '../NotFound';

const SECTIONS: [string, string][] = [['overview', 'Overview'], ['outcomes', 'Outcomes'], ['eligibility', 'Eligibility'], ['curriculum', 'Syllabus'], ['practicals', 'Practicals'], ['resources', 'Tools'], ['format', 'Format & fees'], ['instructor', 'Instructor'], ['certificate', 'Certificate'], ['apply', 'Apply'], ['faq', 'FAQ']];

function SectionNav({ cta }: { cta: React.ReactNode }) {
  const active = useScrollSpy(SECTIONS.map(([id]) => id));
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => { const a = bar.current?.querySelector<HTMLElement>('.is-active'); if (a && bar.current) { const b = bar.current, l = a.offsetLeft - 24; if (l < b.scrollLeft || a.offsetLeft + a.offsetWidth > b.scrollLeft + b.clientWidth) b.scrollTo({ left: Math.max(0, l), behavior: 'smooth' }); } }, [active]);
  return (
    <nav className="pnav pnav--course no-print" aria-label="Sections of this course">
      <div className="container pnav-in">
        <div className="tabbar" ref={bar}>{SECTIONS.map(([id, t]) => <a key={id} href={`#${id}`} onClick={jump(id)} className={active === id ? 'is-active' : ''} aria-current={active === id ? 'location' : undefined}>{t}</a>)}</div>
        <div className="pnav-cta">{cta}</div>
      </div>
    </nav>
  );
}

export default function CourseDetail() {
  const { slug = '' } = useParams();
  const c = courseBySlug(slug);
  const [fmt, setFmt] = useState<Format | null>(null);
  if (!c) return <NotFound />;
  const f: Format = fmt && c.formats.includes(fmt) ? fmt : c.formats[0];
  const S = schoolOf(c.school);
  const Ic = SCHOOL_ICON[c.school];
  const b = batchOf(c.slug);
  const fig = FIGURES[c.figure];
  const fee = feeOf(c, f)!, usd = usdOf(c, f);
  const progs = PROGRAMS.filter((p) => p.steps.includes(c.slug));
  const related = [...COURSES.filter((x) => x.category === c.category && x.slug !== c.slug), ...COURSES.filter((x) => x.school === c.school && x.category !== c.category)].slice(0, 3);
  const instructor = b.instructor ? TEAM.find((m) => m.name === b.instructor) : undefined;
  const wet = c.discipline !== 'dry';
  const apply = <a href="#apply" onClick={jump('apply')} className="button button--accent button--sm">Apply · {inr(fee)}</a>;

  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Vedicgen', path: '/vedicgen' }, { name: 'Courses', path: '/vedicgen/courses' }, { name: c.title, path: `/vedicgen/courses/${c.slug}` }]}
        label={<><Ic width={14} height={14} /> {S.name} · {c.category}</>} title={c.title} lede={c.intro}
        meta={<><DiscBadge d={c.discipline} /><span className={`level level--${c.level.toLowerCase()}`}>{c.level}</span><span><I.Clock width={15} height={15} />{c.days ? `${c.days} days · ${c.hours} hours at the bench` : `Up to ${c.weeks} weeks · ${c.hours} hours live`} · customisable</span><span><I.Award width={15} height={15} />Certificate with verification ID</span></>}
        actions={<><a href="#apply" onClick={jump('apply')} className="button button--accent button--lg">Apply now <I.Arrow /></a><a href="#curriculum" onClick={jump('curriculum')} className="button button--secondary button--lg">View the syllabus</a><button type="button" className="button button--ghost button--lg no-print" onClick={() => window.print()}><I.Print width={17} height={17} />Print</button></>}
        aside={<Figure caption={fig.caption}><fig.C /></Figure>} />

      <SectionNav cta={apply} />

      <section className="section" style={{ paddingTop: 'clamp(36px, 4vw, 56px)' }}>
        <div className="container split-8-4 align-start">
          <div>
            <section id="overview" className="block" aria-labelledby="overview-h">
              <h2 id="overview-h">Course overview</h2>
              <div className="prose" style={{ maxWidth: '68ch' }}>{c.description.map((p) => <p key={p.slice(0, 32)}>{p}</p>)}</div>
              <div className="facts-grid">
                <div><span>Level</span><b>{c.level}</b></div><div><span>Discipline</span><b>{DISCIPLINE_LABEL[c.discipline]}</b></div>
                <div><span>Duration</span><b>{durationShort(c)} · customisable</b></div><div><span>Guided hours</span><b>{c.hours} h</b></div>
                <div><span>Formats</span><b>{c.formats.map((x) => FORMAT_LABEL[x]).join(' · ')}</b></div><div><span>Fee from</span><b>{inr(Math.min(...c.formats.map((x) => feeOf(c, x)!)))} + GST</b></div>
              </div>
            </section>

            <section id="outcomes" className="block" aria-labelledby="outcomes-h">
              <h2 id="outcomes-h">Learning outcomes</h2>
              <p className="block-lede">By the end of the course you will be able to:</p>
              <ol className="numbered numbered--2">{c.outcomes.map((o) => <li key={o}><span>{o}</span></li>)}</ol>
              <div className="stack-sm" style={{ marginTop: 28 }}><p className="label">Skills you will practise</p><div className="tagcloud">{c.skills.map((s) => <span key={s}>{s}</span>)}</div></div>
            </section>

            <section id="eligibility" className="block" aria-labelledby="eligibility-h">
              <h2 id="eligibility-h">Eligibility and prerequisites</h2>
              <div className="col2">
                <div className="stack-sm"><p className="label">Who can apply</p><ul className="checks">{c.eligibility.map((x) => <li key={x}>{x}</li>)}</ul></div>
                <div className="stack-lg">
                  <div className="stack-sm"><p className="label">Prerequisites</p><ul className="dashes">{c.prerequisites.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div className="stack-sm"><p className="label">Best suited to</p><ul className="dashes">{c.forWho.map((x) => <li key={x}>{x}</li>)}</ul></div>
                </div>
              </div>
            </section>

            <section id="curriculum" className="block" aria-labelledby="curriculum-h">
              <h2 id="curriculum-h">Module-wise syllabus</h2>
              <p className="block-lede">{c.modules.length} modules{wet ? ', each with a bench practical performed by every participant.' : '. Each pairs instructor-led sessions with a hands-on lab on public data.'}</p>
              <Accordion className="mods" expandAll defaultOpen={[0]} items={c.modules.map((m, k) => ({
                id: `module-${k + 1}`, lead: String(k + 1).padStart(2, '0'), q: m.title, meta: `${m.topics.length} topics · ${wet ? 'practical' : 'lab'}`,
                a: <div className="mod-grid"><div className="stack-xs"><p className="label">Topics</p><ul className="dashes">{m.topics.map((t) => <li key={t}>{t}</li>)}</ul></div><div className="mod-lab"><span className="label">{wet ? 'Bench practical' : 'Lab'} {k + 1}</span>{m.lab}</div></div>,
              }))} />
            </section>

            <section id="practicals" className="block" aria-labelledby="practicals-h">
              <h2 id="practicals-h">Practical sessions and projects</h2>
              <div className="gpanel stack-sm">
                <p className="label">{wet ? 'Practical assessment' : 'Capstone project'}</p>
                <h3 style={{ fontSize: '1.375rem' }}>{c.project.title}</h3>
                <p className="muted">{c.project.body}</p>
                <p className="small subtle">{wet ? 'Assessed on technique, accuracy, safety and the laboratory record.' : 'Assessed on the correctness of the analysis, the quality of the code and the reasoning in the write-up.'} A pass is required for the certificate.</p>
              </div>
              <ol className="numbered" style={{ marginTop: 28 }}>{c.modules.map((m) => <li key={m.title}><div><b style={{ fontWeight: 650, fontFamily: 'var(--display)' }}>{m.title}</b><p className="muted" style={{ marginTop: 4 }}>{m.lab}</p></div></li>)}</ol>
            </section>

            <section id="resources" className="block" aria-labelledby="resources-h">
              <h2 id="resources-h">{wet ? 'Instruments, techniques and materials' : 'Software, tools and datasets'}</h2>
              <div className="stack-lg">
                <div className="stack-sm"><p className="label">{wet ? 'Instruments and equipment' : 'Software and tools'}</p><div className="tagcloud">{c.tools.map((t) => <span key={t}>{t}</span>)}</div>{!wet && <p className="small muted">All software is free and open source or free for academic use. {c.setup ?? 'Recommended computer: 8 GB RAM, 30 GB free disk, Linux, macOS or Windows with WSL2.'}</p>}</div>
                {c.techniques && <div className="stack-sm"><p className="label">Techniques you will perform</p><ul className="checks checks--ink cols-list">{c.techniques.map((t) => <li key={t}>{t}</li>)}</ul></div>}
                {c.materials && <div className="stack-sm"><p className="label">Materials</p><ul className="dashes">{c.materials.map((m) => <li key={m}>{m}</li>)}</ul></div>}
                {c.datasets && <div className="stack-sm"><p className="label">Datasets</p><ul className="ref-list">{c.datasets.map((d) => <li key={d.name}><b>{d.name}</b>: {d.use}.<span className="src">{d.source}</span></li>)}</ul></div>}
                <div className="stack-sm"><p className="label">Core reading</p><ul className="ref-list">{c.readings.map((r) => <li key={r}>{r}</li>)}</ul></div>
                {c.studio && <div className="notice"><I.Grid width={18} height={18} /><span><b>Practise in your browser with Nayancode.</b> Methods from this course can be tried in {c.studio.label}, free and with nothing to install. <Link to={c.studio.to} className="ulink">Open {c.studio.label}</Link>.</span></div>}
              </div>
            </section>

            <section id="format" className="block" aria-labelledby="format-h">
              <h2 id="format-h">Duration, format and fees</h2>
              <div className="fmt-grid" role="radiogroup" aria-label="Choose a format">
                {c.formats.map((x) => { const fe = feeOf(c, x)!, us = usdOf(c, x); return (
                  <button key={x} type="button" role="radio" aria-checked={x === f} className={`fmt-card ${x === f ? 'is-on' : ''}`} onClick={() => setFmt(x)}>
                    <span className="fmt-k">{FORMAT_LABEL[x]}</span>
                    <span className="fmt-fee"><b>{inr(fe)}</b> + GST</span>
                    <span className="fmt-total">{inr(withGst(fe))} including {Math.round(GST * 100)}% GST{us ? ` · international US$${us}` : ''}</span>
                    <span className="fmt-d"><I.Clock width={14} height={14} />{durationOf(c, x)}</span>
                    <span className="fmt-note">{FORMAT_NOTE[x]}</span>
                  </button>
                ); })}
              </div>
              <div className="notice" style={{ marginTop: 20 }}><I.Calendar width={18} height={18} /><span><b>Flexible duration.</b> {c.days ? WET_FLEX_NOTE : FLEX_NOTE}</span></div>
              <dl className="kv" style={{ marginTop: 24 }}>
                <div><dt>Next cohort</dt><dd className={b.start ? undefined : 'pending'}>{b.start ?? 'Dates are sent with your admission offer'}</dd></div>
                <div><dt>Timetable</dt><dd className={b.schedule ? undefined : 'pending'}>{b.schedule ?? (f === 'live' ? 'Three evening or weekend sessions a week (IST), plus a lab clinic; intensive and weekend-only schedules on request' : f === 'in-person' ? 'Weekdays, 9:30 to 16:30, at our laboratory' : 'Study at your own pace for six months')}</dd></div>
                <div><dt>Payment</dt><dd>Secure online payment link with your admission offer (UPI, cards, net banking). Instalments on request for fees above ₹15,000.</dd></div>
                <div><dt>Refunds</dt><dd>See the <Link to="/refund-policy" className="ulink">refund and cancellation policy</Link>.</dd></div>
              </dl>
            </section>

            <section id="instructor" className="block" aria-labelledby="instructor-h">
              <h2 id="instructor-h">Instructor</h2>
              {instructor ? (
                <div className="split-4-8 align-start" style={{ gap: 28 }}>
                  {instructor.photo ? <img src={instructor.photo} alt={`Portrait of ${instructor.name}`} width={320} height={400} loading="lazy" style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: 'var(--r-3)' }} /> : <div />}
                  <div className="stack-sm"><h3>{instructor.name}</h3><p className="subtle small">{instructor.role}</p><p className="muted">{instructor.bio}</p>{instructor.credentials && <div className="tags">{instructor.credentials.map((x) => <span key={x} className="tag">{x}</span>)}</div>}</div>
                </div>
              ) : (
                <div className="instructor-std">
                  <span className="icon-tile"><I.Users width={22} height={22} /></span>
                  <div className="stack-xs"><p className="muted" style={{ maxWidth: '64ch' }}>{b.instructor ? <>This cohort is taught by <b>{b.instructor}</b>.</> : <>The instructor for each cohort is named in your admission offer and on this page when the cohort is announced.</>} Vedicgen instructors are selected for hands-on {wet ? 'laboratory' : 'research or industry'} experience in the subject they teach, and every course is reviewed by a second subject expert.</p><p className="small subtle">Questions about who teaches a cohort? <a className="ulink" href={`mailto:${BRAND.emails.help}`}>{BRAND.emails.help}</a></p></div>
                </div>
              )}
            </section>

            <section id="certificate" className="block" aria-labelledby="certificate-h">
              <h2 id="certificate-h">Certificate</h2>
              <div className="col2 align-center">
                <div className="stack-sm">
                  <p className="muted">Learners who complete the course and pass its {wet ? 'practical assessment' : 'capstone'} receive a Vedicgen certificate of completion for <b>{c.title}</b>, issued by {BRAND.name}, stating the {wet ? 'bench hours and techniques performed' : 'guided hours and skills assessed'}. Each certificate has a unique ID and QR code that anyone can check.</p>
                  <p><Link to="/verify" className="textlink">Verify a certificate <I.Arrow width={15} height={15} /></Link></p>
                </div>
                <div className="cert-card"><div className="cert-head"><span className="label">Certificate of completion</span><span className="tag tag--plain">Sample</span></div><b>{c.title}</b><span className="small subtle">Awarded to the learner named on the certificate · {c.hours} hours</span><div className="cert-foot"><span className="mono xsmall">ID · VG-XXXX-XXXX</span><span className="small">Vivofold Vedicgen</span></div></div>
              </div>
            </section>

            <section id="apply" className="block" aria-labelledby="apply-h">
              <h2 id="apply-h">Apply for {c.title}</h2>
              <ol className="steps steps--inline" style={{ ['--n' as string]: 4 }}>
                <li><h3>Apply</h3><p>Send the form below. It takes about five minutes.</p></li>
                <li><h3>Review</h3><p>An adviser confirms your fit and format within two working days.</p></li>
                <li><h3>Offer</h3><p>You receive dates, timetable and a secure payment link.</p></li>
                <li><h3>Onboard</h3><p>{wet ? 'Safety briefing, lab address and joining instructions.' : 'Set-up guide, pre-reading and joining links.'}</p></li>
              </ol>
              <div className="form-card" style={{ marginTop: 28 }}>
                <ApplicationForm programme={c.title} options={[c.title]} formats={c.formats.map((x) => `${FORMAT_LABEL[x]} (${inr(feeOf(c, x)!)} + GST)`)} wet={wet} kind="Course application" minSop={40} />
              </div>
            </section>

            <section id="faq" className="block" aria-labelledby="faq-h">
              <h2 id="faq-h">Frequently asked questions</h2>
              <Accordion items={c.faq} defaultOpen={[]} />
            </section>
          </div>

          <aside className="course-aside only-lg" aria-label="Fees and enrolment">
            <div className="enrol">
              <span className="status status--open">Applications open</span>
              <div className="seg seg--full" role="group" aria-label="Format">{c.formats.map((x) => <button key={x} type="button" aria-pressed={x === f} onClick={() => setFmt(x)}>{x === 'self-paced' ? 'Self-paced' : x === 'live' ? 'Live' : 'In person'}</button>)}</div>
              <div><div className="price">{inr(fee)} <small>+ GST</small></div><p className="small subtle" style={{ marginTop: 6 }}>{inr(withGst(fee))} incl. GST{usd ? ` · US$${usd} international` : ''}</p></div>
              <dl className="kv">
                <div><dt>Duration</dt><dd>{durationOf(c, f)}</dd></div>
                <div><dt>Level</dt><dd>{c.level}</dd></div>
                <div><dt>Where</dt><dd>{f === 'in-person' ? 'Vivofold laboratory' : 'Online'}</dd></div>
                <div><dt>Certificate</dt><dd>Verifiable ID</dd></div>
              </dl>
              {b.paymentUrl ? <a href={b.paymentUrl} className="button button--accent button--block" target="_blank" rel="noopener noreferrer">Enrol and pay <I.External width={15} height={15} /></a> : <a href="#apply" onClick={jump('apply')} className="button button--accent button--block">Apply now <I.Arrow /></a>}
              <a href="#curriculum" onClick={jump('curriculum')} className="button button--secondary button--block">View the syllabus</a>
              <p className="xsmall subtle">Questions? <a className="ulink" href={`mailto:${BRAND.emails.help}`}>{BRAND.emails.help}</a></p>
            </div>
            {progs.length > 0 && <div className="stack-sm"><p className="label">Save with a programme</p>{progs.map((p) => <Link key={p.slug} to={`/vedicgen/programs/${p.slug}`} className="aside-prog"><b>{p.title}</b><span>{p.steps.length} courses · {inr(p.fee)} + GST</span></Link>)}</div>}
          </aside>
        </div>
      </section>

      {progs.length > 0 && (
        <section className="section section--grad" aria-labelledby="inprog-h">
          <div className="container">
            <Reveal className="band-head"><div><p className="kicker kicker--vg">Part of a programme</p><h2 id="inprog-h">Take this course as part of a programme and save.</h2></div></Reveal>
            <div className="cgrid">{progs.map((p, i) => <ProgramCard key={p.slug} p={p} index={i} />)}</div>
          </div>
        </section>
      )}
      <section className="section section--alt" aria-labelledby="related-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--vg">Continue learning</p><h2 id="related-h">Related courses</h2></div><Link to={`/vedicgen/courses?school=${c.school}`} className="button button--secondary">More in {S.short} <I.Arrow /></Link></Reveal>
          <div className="cgrid">{related.map((r, i) => <CourseCard key={r.slug} c={liteCourse(r.slug)!} index={i} />)}</div>
        </div>
      </section>
    </>
  );
}
