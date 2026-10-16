import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { BRAND } from '@/core/brand';
import { Pipeline, ReportFigure } from '../blocks';
import { courseBySlug } from '../data/lite';
import { INCLUDED, PROCESS, SERVICE_CATEGORIES, SERVICES, serviceBySlug, STATUS_NOTE, statusOf } from '../data/services';
import { Figure, FIGURES } from '../figures';
import Form, { F } from '../Form';
import { I } from '../icons';
import { Link } from '../Link';
import { FaqSection, jump, PageHeader, Reveal, tabKeys } from '../primitives';
import { CourseRowCompact, ServiceCard } from '../ui';
import NotFound from './NotFound';

const GENERAL_FAQ = [
  { q: 'How much does an analysis cost?', a: 'It depends on the data type, the number of samples and the depth of interpretation you need. Every project receives a free written quote with scope, deliverables and price before any work begins.' },
  { q: 'Which services are available now?', a: 'Dry-lab analysis and Bio-IT services marked “Available now” accept projects today. Services marked “On request” are offered case by case. Wet-lab services are marked “Planned”: they are not open yet, and registering interest helps us prioritise.' },
  { q: 'What data formats do you accept?', a: 'Raw FASTQ, BAM/CRAM, count matrices, VCF, Cell Ranger outputs, h5ad or Seurat objects, structure files, compound lists, images and tabular data. If you are unsure, describe what your provider sent you.' },
  { q: 'Do you sign confidentiality agreements?', a: 'Yes, before any data are shared. Data are used only for your project, transferred through a channel you approve and deleted at the end of the engagement on request.' },
  { q: 'Is this suitable for clinical diagnosis?', a: 'No. Our services are for research use only and are not a medical diagnostic service.' },
];
type Lane = 'all' | 'dry' | 'bioit' | 'wet';
const LANES: [Lane, string][] = [['all', 'All services'], ['dry', 'Dry-lab analysis'], ['bioit', 'Bio-IT & software'], ['wet', 'Wet lab']];
const laneOf = (s: (typeof SERVICES)[number]): Lane => (s.discipline === 'wet' ? 'wet' : s.category === 'Bio-IT & software' ? 'bioit' : 'dry');

function QuoteForm({ preset, planned }: { preset?: string; planned?: boolean }) {
  return (
    <Form kind={planned ? 'Service interest' : 'Quote request'} inbox="general" subject={(v) => `[${planned ? 'Interest' : 'Quote'}] ${v.service}: ${v.name}`} submitLabel={planned ? 'Register interest' : 'Request a quote'} initial={{ service: preset ?? '' }} doneTitle={planned ? 'Thank you. We will contact you when this service opens.' : 'Thank you. Your project details have been sent.'}
      fields={[F.name, F.email, F.org, F.phone,
        { name: 'service', label: 'Service', type: 'select', required: true, options: [...SERVICES.map((s) => s.title), 'Not sure yet'], half: true },
        { name: 'samples', label: 'Number of samples or scale', placeholder: 'e.g. 12 samples', half: true },
        { name: 'data', label: 'Data you have', type: 'select', options: ['Raw reads (FASTQ)', 'Aligned reads (BAM/CRAM)', 'Count matrix', 'Variant calls (VCF)', 'Single-cell matrices or objects', 'Images', 'Structures or compounds', 'Code or a software idea', 'Not generated yet'], half: true },
        { name: 'timeline', label: 'Timeline', type: 'select', options: ['As soon as possible', 'Within a month', 'In one to three months', 'Flexible'], half: true },
        F.message('Project description', 'Organism, design (for example 3 treated and 3 control), data type and the questions you want answered.'), F.consent]}
      done={planned ? 'Registering is free and carries no obligation.' : 'We will reply with questions or a written quote, usually within two working days.'} />
  );
}

export function ServicesHub() {
  const [params] = useSearchParams();
  const [lane, setLane] = useState<Lane>('all');
  useEffect(() => { const d = params.get('d'); if (d === 'wet' || d === 'dry' || d === 'bioit') setLane(d); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const ids = LANES.map(([k]) => k);
  const list = SERVICES.filter((s) => lane === 'all' || laneOf(s) === lane);
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]} label="Solagene Research & Services" title="Research services, from data to decision"
        lede="Genomics, transcriptomics, single-cell, multi-omics, structural biology, docking, QSAR, imaging, pipelines, cloud and custom scientific software, with every capability labelled honestly as available, on request or planned."
        actions={<><a href="#quote" onClick={jump('quote')} className="button button--accent button--lg">Request a free quote <I.Arrow /></a><a href="#process" onClick={jump('process')} className="button button--secondary button--lg">How an engagement runs</a></>}
        aside={<Figure caption={FIGURES.workflow.caption}><FIGURES.workflow.C /></Figure>} />

      <section className="section" aria-labelledby="catalogue-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Services</p><h2 id="catalogue-h">{list.length} services</h2></div>
          </Reveal>
          <div className="ptabs" role="tablist" aria-label="Service type">{LANES.map(([k, t]) => <button key={k} type="button" role="tab" aria-selected={lane === k} tabIndex={lane === k ? 0 : -1} onClick={() => setLane(k)} onKeyDown={(e) => tabKeys(e, ids, lane, setLane)}>{t}<span className="ct">{k === 'all' ? SERVICES.length : SERVICES.filter((s) => laneOf(s) === k).length}</span></button>)}</div>
          <div className="tab-panel" key={lane} style={{ marginTop: 24 }}>
            {SERVICE_CATEGORIES.map((cat) => { const cs = list.filter((s) => s.category === cat); return cs.length ? <div key={cat} className="school-group"><div className="group-head"><h3>{cat}</h3><span className="label">{cs.length}</span></div><div className="cgrid">{cs.map((s, i) => <ServiceCard key={s.slug} s={s} index={i} />)}</div></div> : null; })}
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="included-h">
        <div className="container split-5-7 align-center">
          <Reveal className="stack-md"><p className="kicker">What you receive</p><h2 id="included-h">Results you can defend to a reviewer.</h2><p className="lede">Every analysis project, whatever the service, includes:</p><ul className="checks checks--ink">{INCLUDED.map((x) => <li key={x}>{x}</li>)}</ul></Reveal>
          <Reveal index={1}><ReportFigure /></Reveal>
        </div>
      </section>

      <section className="section" id="process" aria-labelledby="process-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Process</p><h2 id="process-h">From first message to final report.</h2></div><p className="lede">Scope, price and delivery date are agreed in writing before any work starts, and you see quality-control results before the main analysis.</p></Reveal>
          <Reveal as="ol" className="steps" style={{ ['--n' as string]: PROCESS.length }}>{PROCESS.map((p) => <li key={p.t}><h3>{p.t}</h3><p>{p.d}</p></li>)}</Reveal>
        </div>
      </section>

      <section className="section section--alt" id="quote" aria-labelledby="quote-h">
        <div className="container split-4-8 align-start">
          <div className="rail-head"><p className="kicker">Free quote</p><h2 id="quote-h">Tell us about your project.</h2><p className="muted">A few details are enough to start. We reply with questions or a written quote; there is no charge and no obligation.</p><p className="small subtle">Prefer e-mail? <a className="ulink" href={`mailto:${BRAND.emails.general}`}>{BRAND.emails.general}</a></p></div>
          <Reveal className="form-card"><QuoteForm /></Reveal>
        </div>
      </section>
      <FaqSection items={GENERAL_FAQ} />
    </>
  );
}

export function ServiceDetail() {
  const { slug = '' } = useParams();
  const s = serviceBySlug(slug);
  if (!s) return <NotFound />;
  const status = statusOf(s);
  const planned = status === 'planned';
  const fig = FIGURES[s.figure];
  const course = s.course ? courseBySlug(s.course) : undefined;
  const others = [...SERVICES.filter((x) => x.category === s.category && x.slug !== s.slug), ...SERVICES.filter((x) => x.category !== s.category)].slice(0, 3);
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, { name: s.title, path: `/services/${s.slug}` }]} label={s.category} title={s.title} lede={s.intro}
        actions={<><a href="#quote" onClick={jump('quote')} className="button button--accent button--lg">{planned ? 'Register interest' : 'Request a free quote'} <I.Arrow /></a>{course ? <Link to={`/vedicgen/courses/${course.slug}`} className="button button--secondary button--lg">Learn to do this yourself</Link> : <Link to="/services" className="button button--secondary button--lg">All services</Link>}</>}
        aside={<Figure caption={fig.caption}><fig.C /></Figure>} />
      {planned && <div className="container" style={{ marginTop: 28 }}><div className="notice"><I.Info width={18} height={18} /><span>{STATUS_NOTE[status]}</span></div></div>}

      <section className="section" aria-label="Scope">
        <div className="container col3">
          <Reveal className="stack-sm"><p className="label">Who it is for</p><ul className="dashes">{s.forWho.map((x) => <li key={x}>{x}</li>)}</ul></Reveal>
          <Reveal index={1} className="stack-sm"><p className="label">What you send us</p><ul className="ruled-list">{s.inputs.map((x) => <li key={x.t}><b style={{ fontWeight: 600 }}>{x.t}</b><span className="small muted" style={{ display: 'block' }}>{x.d}</span></li>)}</ul></Reveal>
          <Reveal index={2} className="stack-sm"><p className="label">What you receive</p><ul className="checks checks--ink">{s.deliverables.map((x) => <li key={x}>{x}</li>)}</ul></Reveal>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="method-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Methodology</p><h2 id="method-h">How the work runs</h2></div><p className="lede">Each step is agreed with you and documented. Typical tools: <span className="mono">{s.tools.join(' · ')}</span></p></Reveal>
          <Pipeline steps={s.steps} label={s.title} />
        </div>
      </section>

      <section className="section" aria-labelledby="qc-h">
        <div className="container col2">
          <Reveal className="stack-sm"><p className="label">Quality controls</p><h2 id="qc-h" style={{ fontSize: 'clamp(1.375rem, 1.2rem + 0.6vw, 1.75rem)' }}>Checks applied to every project</h2><ul className="checks" style={{ marginTop: 8 }}>{s.qc.map((x) => <li key={x}>{x}</li>)}</ul></Reveal>
          <Reveal index={1} className="stack-sm"><p className="label">Scope and limits</p><h2 style={{ fontSize: 'clamp(1.375rem, 1.2rem + 0.6vw, 1.75rem)' }}>What the work can and cannot show</h2><ul className="dashes" style={{ marginTop: 8 }}>{s.limits.map((x) => <li key={x}>{x}</li>)}</ul></Reveal>
        </div>
      </section>

      <section className="section section--alt" id="quote" aria-labelledby="quote-h">
        <div className="container split-4-8 align-start">
          <div className="rail-head"><p className="kicker">{planned ? 'Register interest' : 'Free quote'}</p><h2 id="quote-h">{planned ? 'Be told first when this opens.' : `Start a ${s.title.split(' ')[0]} project.`}</h2><p className="muted">{planned ? 'No obligation. We use registrations to plan the service.' : 'Describe your data and questions. We reply with questions or a written quote.'}</p>{course && <div style={{ marginTop: 16 }}><p className="label">Prefer to learn it?</p><CourseRowCompact c={course} /></div>}</div>
          <Reveal className="form-card"><QuoteForm preset={s.title} planned={planned} /></Reveal>
        </div>
      </section>
      <FaqSection items={s.faq} />
      <section className="section section--ruled" aria-labelledby="other-h">
        <div className="container"><Reveal className="band-head"><div><p className="kicker">Related</p><h2 id="other-h">Other services</h2></div><Link to="/services" className="button button--secondary">All services <I.Arrow /></Link></Reveal><div className="cgrid">{others.map((o, i) => <ServiceCard key={o.slug} s={o} index={i} />)}</div></div>
      </section>
    </>
  );
}
