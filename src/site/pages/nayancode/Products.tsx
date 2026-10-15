import { asset } from '../../brand';
import { useParams } from 'react-router-dom';
import { BRAND } from '@/core/brand';
import { courseBySlug } from '../../data/lite';
import { LICENSING, PLATFORMS, PRODUCT_LINES, productBySlug, PRODUCTS } from '../../data/products';
import Form, { F } from '../../Form';
import { I } from '../../icons';
import { Link } from '../../Link';
import { jump, PageHeader, Reveal } from '../../primitives';
import { CourseRowCompact, ProductCard } from '../../ui';
import NotFound from '../NotFound';

export function ProductsHub() {
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Nayancode', path: '/nayancode' }, { name: 'Products', path: '/nayancode/products' }]} label="Vivofold Nayancode · Products" title="Scientific software products"
        lede={`${PRODUCTS.length} products that run in your browser: the Workbench suite, nine analysis studios, a gene atlas, a report builder and pipeline import. All live, all free during the public preview.`}
        actions={<Link to="/workbench" className="button button--accent button--lg"><I.Grid width={17} height={17} />Launch the Workbench</Link>} />
      {PRODUCT_LINES.map((line) => { const ps = PRODUCTS.filter((p) => p.line === line); return ps.length ? (
        <section key={line} className="section section--tight" aria-labelledby={`l-${line}`}>
          <div className="container"><Reveal className="band-head"><div><p className="kicker kicker--nc">{line}</p><h2 id={`l-${line}`} style={{ fontSize: 'clamp(1.5rem, 1.2rem + 1vw, 2.1rem)' }}>{ps.length} product{ps.length > 1 ? 's' : ''}</h2></div></Reveal><div className="cgrid">{ps.map((p, i) => <ProductCard key={p.slug} p={p} index={i} />)}</div></div>
        </section>
      ) : null; })}
    </>
  );
}

export function ProductDetail() {
  const { slug = '' } = useParams();
  const p = productBySlug(slug);
  if (!p) return <NotFound />;
  const others = PRODUCTS.filter((x) => x.slug !== p.slug && (x.line === p.line || x.slug === 'workbench')).slice(0, 3);
  const short = p.name.replace('Nayancode ', '');
  return (
    <>
      <section className="dhero dhero--nc on-ink" aria-labelledby="p-h" style={{ paddingBottom: 'clamp(40px, 5vw, 72px)' }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb"><ol><li><Link to="/">Home</Link></li><li><Link to="/nayancode">Nayancode</Link></li><li><Link to="/nayancode/products">Products</Link></li><li><span aria-current="page">{short}</span></li></ol></nav>
          <div className="dhero-grid">
            <div className="dhero-copy">
              <p className="kicker" style={{ color: '#b3a6ff' }}>{p.line}</p>
              <h1 id="p-h">{p.name}</h1>
              <p className="lede" style={{ fontSize: '1.25rem', color: '#fff' }}>{p.tagline}</p>
              <p className="lede">{p.short}</p>
              <div className="inline"><Link to={p.app} className="button button--grad button--lg"><I.Play width={16} height={16} />Open {short}</Link><a href="#demo" onClick={jump('demo')} className="button button--secondary button--lg">Request a demo</a></div>
              <p className="small" style={{ color: '#a7b2cf' }}>Free · runs in your browser · nothing uploaded</p>
            </div>
            <Reveal className="nc-hero-shot"><div className="shot-frame"><div className="bar"><i /><i /><i /></div><img src={asset(p.shot)} alt={`Screenshot of ${p.name}`} width={1280} height={800} /></div></Reveal>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="ov-h">
        <div className="container split-7-5 align-start">
          <Reveal className="stack-md"><p className="kicker kicker--nc">Overview</p><h2 id="ov-h">What {short} does</h2><div className="prose">{p.description.map((d) => <p key={d.slice(0, 30)}>{d}</p>)}</div></Reveal>
          <Reveal index={1} className="spec">
            <p className="label">Technical specifications</p>
            <dl>
              <div><dt>Inputs</dt><dd>{p.inputs.join(' · ')}</dd></div>
              <div><dt>Outputs</dt><dd>{p.outputs.join(' · ')}</dd></div>
              <div><dt>Engine</dt><dd>{p.engine}</dd></div>
              <div><dt>Platforms</dt><dd>{PLATFORMS.join(' · ')}</dd></div>
              <div><dt>Limits</dt><dd>{p.limits}</dd></div>
              <div><dt>Licence</dt><dd>Free during the public preview; institutional licences on request</dd></div>
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="ft-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--nc">Features</p><h2 id="ft-h">Capabilities</h2></div></Reveal>
          <div className="cgrid">{p.features.map((f, i) => <Reveal key={f.t} index={i} className="ccard-wrap"><div className="ccard" style={{ ['--accent' as string]: 'var(--violet)' }}><span className="feat-num">{String(i + 1).padStart(2, '0')}</span><h3>{f.t}</h3><p>{f.d}</p></div></Reveal>)}</div>
        </div>
      </section>

      <section className="section" aria-labelledby="uc-h">
        <div className="container col2 align-start">
          <Reveal className="stack-md"><p className="kicker kicker--nc">Use cases</p><h2 id="uc-h" style={{ fontSize: 'clamp(1.5rem, 1.2rem + 0.8vw, 2rem)' }}>Who uses it, and for what</h2><ul className="checks checks--ink">{p.useCases.map((u) => <li key={u}>{u}</li>)}</ul></Reveal>
          <Reveal index={1} className="stack-md"><p className="kicker kicker--nc">Documentation</p><h2 style={{ fontSize: 'clamp(1.5rem, 1.2rem + 0.8vw, 2rem)' }}>Quick start</h2>
            <ol className="timeline">
              <li><h3>Open {short}</h3><p>Use the button on this page or the Workbench menu. Nothing to install; works in current Chrome, Edge, Firefox and Safari.</p></li>
              <li><h3>Load data or the demo</h3><p>Drop in your files ({p.inputs.slice(0, 3).join(', ')}) or load the labelled synthetic demo to explore safely.</p></li>
              <li><h3>Run and inspect</h3><p>Results appear as interactive figures and tables; each analysis records its parameters and versions.</p></li>
              <li><h3>Export and cite</h3><p>Export figures and tables, add them to a report, and copy the auto-written methods paragraph.</p></li>
            </ol>
            <Link to="/nayancode/docs" className="textlink">Full documentation <I.Arrow width={15} height={15} /></Link>
          </Reveal>
        </div>
      </section>

      {p.courses.length > 0 && <section className="section section--tight section--alt" aria-labelledby="learn-h"><div className="container"><Reveal className="band-head"><div><p className="kicker kicker--vg">Learn the methods with Vedicgen</p><h2 id="learn-h" style={{ fontSize: 'clamp(1.4rem, 1.2rem + 0.8vw, 1.9rem)' }}>Courses that use {short}</h2></div></Reveal><div className="crow-list">{p.courses.map((s) => { const c = courseBySlug(s); return c ? <CourseRowCompact key={s} c={c} /> : null; })}</div></div></section>}

      <section className="section" id="demo" aria-labelledby="demo-h">
        <div className="container split-4-8 align-start">
          <div className="rail-head"><p className="kicker kicker--nc">Talk to us</p><h2 id="demo-h">Request a demo or ask a question</h2><p className="muted">For classroom use, self-hosted deployments, custom studios or support. We reply within two working days.</p>
            <div className="stack-sm" style={{ marginTop: 12 }}>{LICENSING.map((l) => <p key={l.name} className="small"><b>{l.name}:</b> {l.price}</p>)}</div>
          </div>
          <Reveal className="form-card"><Form kind="Product enquiry" inbox="support" initial={{ product: p.name }} subject={(v) => `[Nayancode] ${v.topic}: ${v.product} (${v.name})`} submitLabel="Send request" doneTitle="Thank you. Our software team will be in touch."
            fields={[F.name, F.email, { name: 'org', label: 'Organisation', required: true, half: true, autoComplete: 'organization' }, { name: 'role', label: 'Role', type: 'select', half: true, options: ['Student', 'Researcher', 'Faculty / educator', 'Bioinformatician', 'Lab or IT manager', 'Industry scientist', 'Other'] }, { name: 'product', label: 'Product', type: 'select', required: true, options: PRODUCTS.map((x) => x.name) }, { name: 'topic', label: 'What would you like?', type: 'select', required: true, half: true, options: ['Live demo', 'Classroom / teaching use', 'Self-hosted or enterprise licence', 'Custom features or integration', 'Technical support', 'Report a problem'] }, { name: 'team', label: 'Team or class size', type: 'select', half: true, options: ['Just me', '2–10', '11–50', '51–200', 'More than 200'] }, F.message('Details', 'What you want to analyse or achieve, and any requirements.'), F.consent]} /></Reveal>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="more-h"><div className="container"><Reveal className="band-head"><div><p className="kicker kicker--nc">More from Nayancode</p><h2 id="more-h">Related products</h2></div><Link to="/nayancode/products" className="button button--secondary">All products <I.Arrow /></Link></Reveal><div className="cgrid">{others.map((o, i) => <ProductCard key={o.slug} p={o} index={i} />)}</div><p className="small subtle" style={{ marginTop: 18 }}>Software support: <a className="ulink" href={`mailto:${BRAND.emails.support}`}>{BRAND.emails.support}</a></p></div></section>
    </>
  );
}
