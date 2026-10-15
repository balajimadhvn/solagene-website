import { useParams } from 'react-router-dom';
import { ALGOS } from '../content';
import { courseBySlug, internshipBySlug, productBySlug, serviceBySlug } from '../data/lite';
import { RESEARCH, researchBySlug, type ResearchStatus } from '../data/research';
import { Figure, FIGURES } from '../figures';
import Form, { F } from '../Form';
import { I } from '../icons';
import { Link } from '../Link';
import { jump, PageHeader, Reveal } from '../primitives';
import { CourseRowCompact } from '../ui';
import NotFound from './NotFound';

function CollabForm({ area }: { area?: string }) {
  return (
    <Form kind="Research collaboration" inbox="general" initial={{ area: area ?? '' }} subject={(v) => `[Research] ${v.kind}: ${v.area || 'general'} (${v.name})`} submitLabel="Send proposal" doneTitle="Thank you. Our research team will reply."
      fields={[F.name, F.email, { name: 'org', label: 'Institution or company', required: true, half: true, autoComplete: 'organization' }, { name: 'role', label: 'Role', type: 'select', half: true, options: ['Principal investigator', 'Researcher', 'PhD student', 'Industry scientist', 'Clinician', 'Other'] },
        { name: 'kind', label: 'Interest', type: 'select', required: true, half: true, options: ['Research collaboration', 'Student research project', 'Data or method question', 'Funding or grant partnership'] }, { name: 'area', label: 'Research area', type: 'select', half: true, options: RESEARCH.map((r) => r.title) }, F.message('Proposal or question', 'The question, data or idea you would like to work on.'), F.consent]} />
  );
}

export function ResearchHub() {
  const st = 'all' as 'all' | ResearchStatus;
  const list = RESEARCH.filter((r) => st === 'all' || r.status === st);
  const areas = [...new Set(ALGOS.map((a) => a.area))];
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Research', path: '/research' }]} label="Vivofold Research" title="Research questions behind our work"
        lede="Seven areas of research, from the reliability of genomic analyses and structure-based drug design to machine learning for biology and validated scientific software. Each area lists the questions we are asking and the methods we use."
        actions={<><a href="#areas" onClick={jump('areas')} className="button button--accent button--lg">Research areas <I.Arrow /></a><a href="#collaborate" onClick={jump('collaborate')} className="button button--secondary button--lg">Collaborate</a></>}
        aside={<Figure caption={FIGURES.workflow.caption}><FIGURES.workflow.C /></Figure>} />
      <section className="section" id="areas" aria-labelledby="areas-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Research areas</p><h2 id="areas-h">{list.length} areas</h2></div></Reveal>
          <div className="rgrid" key={st}>{list.map((r, i) => <Reveal key={r.slug} index={i} className="ccard-wrap"><Link to={`/research/${r.slug}`} className="rcard"><div className="ccard-top"><span className="num">{String(RESEARCH.indexOf(r) + 1).padStart(2, '0')}</span></div><h3>{r.title}</h3><p>{r.short}</p><span className="ccard-go">Explore <I.Arrow width={15} height={15} /></span></Link></Reveal>)}</div>
        </div>
      </section>
      <section className="section section--alt" aria-labelledby="methods-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Research output</p><h2 id="methods-h">The methods library</h2><p className="lede">Published algorithms we have re-implemented clean-room, tested against known answers and shipped in Nayancode software.</p></div><Link to="/nayancode" className="button button--secondary">Nayancode software <I.Arrow /></Link></Reveal>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Table (scrolls sideways on small screens)"><table className="ptable">
            <thead><tr><th scope="col">Method</th><th scope="col">Area</th><th scope="col">Where</th><th scope="col">How it is checked</th></tr></thead>
            <tbody>{areas.flatMap((a) => ALGOS.filter((x) => x.area === a)).map((x) => <tr key={x.name}><th scope="row">{x.name}</th><td>{x.area}</td><td>{x.where}</td><td>{x.check}</td></tr>)}</tbody>
          </table></div>
        </div>
      </section>
      <section className="section" aria-labelledby="open-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Open projects</p><h2 id="open-h">Projects open to collaborators and student researchers</h2></div><Link to="/vedicgen/research-training" className="button button--secondary">Research training <I.Arrow /></Link></Reveal>
          <div className="cgrid">{RESEARCH.flatMap((r) => r.projects.map((p) => ({ ...p, r }))).slice(0, 12).map((p, i) => <Reveal key={p.t} index={i} className="ccard-wrap"><Link to={`/research/${p.r.slug}`} className="ccard"><div className="ccard-top"><span className="ccard-school">{p.r.title}</span></div><h3>{p.t}</h3><p>{p.d}</p></Link></Reveal>)}</div>
        </div>
      </section>
      <section className="section section--alt" id="collaborate" aria-labelledby="col-h">
        <div className="container split-4-8 align-start">
          <div className="rail-head"><p className="kicker">Collaborate</p><h2 id="col-h">Work on a research question with us</h2><p className="muted">We welcome collaborations with laboratories, clinicians and companies, and research projects with students.</p></div>
          <Reveal className="form-card"><CollabForm /></Reveal>
        </div>
      </section>
    </>
  );
}

export function ResearchArea() {
  const { slug = '' } = useParams();
  const r = researchBySlug(slug);
  if (!r) return <NotFound />;
  const fig = FIGURES[r.figure];
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Research', path: '/research' }, { name: r.title, path: `/research/${r.slug}` }]} label="Vivofold Research" title={r.title} lede={r.intro}
        actions={<a href="#collaborate" onClick={jump('collaborate')} className="button button--accent button--lg">Collaborate <I.Arrow /></a>} aside={<Figure caption={fig.caption}><fig.C /></Figure>} />
      <section className="section">
        <div className="container col2 align-start">
          <Reveal className="stack-md"><p className="kicker">Questions</p><h2 style={{ fontSize: 'clamp(1.5rem, 1.2rem + 0.8vw, 2rem)' }}>What we want to know</h2><ol className="numbered">{r.questions.map((q) => <li key={q}><span>{q}</span></li>)}</ol></Reveal>
          <Reveal index={1} className="stack-md"><p className="kicker">Approach</p><h2 style={{ fontSize: 'clamp(1.5rem, 1.2rem + 0.8vw, 2rem)' }}>How we work on it</h2><ul className="checks checks--ink">{r.approaches.map((a) => <li key={a}>{a}</li>)}</ul>{r.methods.length > 0 && <><p className="label" style={{ marginTop: 12 }}>Methods already implemented</p><div className="tagcloud">{r.methods.map((m) => <span key={m}>{m}</span>)}</div></>}</Reveal>
        </div>
      </section>
      <section className="section section--alt" aria-labelledby="proj-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Open projects</p><h2 id="proj-h">Projects you can join</h2></div></Reveal>
          <div className="cgrid">{r.projects.map((p, i) => <Reveal key={p.t} index={i} className="ccard-wrap"><div className="ccard"><span className="feat-num">{String(i + 1).padStart(2, '0')}</span><h3>{p.t}</h3><p>{p.d}</p></div></Reveal>)}</div>
        </div>
      </section>
      <section className="section" aria-labelledby="rel-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Across Vivofold</p><h2 id="rel-h">Learn it, use it, commission it</h2></div></Reveal>
          <div className="cgrid">
            <Reveal className="stack-sm"><p className="label">Vedicgen courses</p><div className="crow-list">{r.courses.map((s) => { const c = courseBySlug(s); return c ? <CourseRowCompact key={s} c={c} /> : null; })}</div>{r.internships.map((s) => { const x = internshipBySlug(s); return x ? <Link key={s} to={`/vedicgen/internships/${s}`} className="textlink small">{x.title} <I.Arrow width={14} height={14} /></Link> : null; })}</Reveal>
            <Reveal index={1} className="stack-sm"><p className="label">Research services</p>{r.services.map((s) => { const x = serviceBySlug(s); return x ? <Link key={s} to={`/services/${s}`} className="aside-prog"><b>{x.title}</b><span>{x.short}</span></Link> : null; })}</Reveal>
            <Reveal index={2} className="stack-sm"><p className="label">Nayancode software</p>{r.products.length ? r.products.map((s) => { const x = productBySlug(s); return x ? <Link key={s} to={`/nayancode/products/${s}`} className="aside-prog"><b>{x.name}</b><span>{x.tagline}</span></Link> : null; }) : <p className="small subtle">Software for this area is on the roadmap.</p>}</Reveal>
          </div>
        </div>
      </section>
      <section className="section section--alt" id="collaborate" aria-labelledby="col-h">
        <div className="container split-4-8 align-start">
          <div className="rail-head"><p className="kicker">Collaborate</p><h2 id="col-h">Propose a project in {r.title.toLowerCase()}</h2></div>
          <Reveal className="form-card"><CollabForm area={r.title} /></Reveal>
        </div>
      </section>
    </>
  );
}
