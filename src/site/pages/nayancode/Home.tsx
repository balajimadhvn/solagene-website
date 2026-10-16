import { asset } from '../../brand';
import { useState } from 'react';
import { BRAND, DIVISIONS } from '@/core/brand';
import { STUDIOS } from '@/core/studios';
import { LICENSING, PRODUCT_LINES, ROADMAP } from '../../data/labels';
import { PRODUCTS, TOOLS } from '../../data/lite';
import { I } from '../../icons';
import { Link } from '../../Link';
import { FaqSection, Reveal, tabKeys } from '../../primitives';
import { CountUp, ProductCard } from '../../ui';

const PRINCIPLES = [
  { Ic: I.Lock, t: 'Private by construction', d: 'Files are analysed on your own computer with Web Workers and WebAssembly. A live meter shows the bytes sent anywhere: for your data, zero.' },
  { Ic: I.Clipboard, t: 'Reproducible by default', d: 'Every analysis records tool, version, parameters and an input checksum, and writes a citable methods paragraph.' },
  { Ic: I.Shield, t: 'Validated against known answers', d: 'Each studio ships synthetic demo data and checks its own result against the planted truth wherever possible.' },
  { Ic: I.Globe, t: 'Open and licence-clean', d: 'Built on permissively licensed components and openly licensed data, audited automatically on every build.' },
];
const FAQ = [
  { q: 'Is Nayancode free?', a: 'Yes. All live studios and free tools are free during the public preview, with no account. Institutional licences, self-hosted deployments and support plans are quoted on request.' },
  { q: 'Is my data uploaded?', a: 'No. Analyses run in your browser. Data leave your computer only when you explicitly ask for a public-database lookup (for example ClinVar or PubChem), and only the identifiers you look up are sent.' },
  { q: 'What are the limits?', a: 'Nayancode is designed for browser-scale data, for example read mapping against references up to about 100 Mb. Heavy pipelines belong on a cluster or cloud; their results can then be imported.' },
  { q: 'Can I use Nayancode for teaching?', a: 'Yes, and it is free for classrooms. Students need only a browser, which makes hands-on workshops possible in any computer lab.' },
  { q: 'Can Nayancode build custom software for us?', a: 'Yes. Custom scientific software development is offered as a Solagene service, from analysis tools to complete web applications.' },
];

export default function NayancodeHome() {
  const [line, setLine] = useState<(typeof PRODUCT_LINES)[number] | 'All'>('All');
  const ids = ['All', ...PRODUCT_LINES] as const;
  const list = PRODUCTS.filter((p) => line === 'All' || p.line === line);
  const wb = PRODUCTS[0];
  return (
    <>
      <section className="dhero dhero--nc on-ink" aria-labelledby="nc-hero">
        <div className="container dhero-grid">
          <div className="dhero-copy">
            <p className="kicker" style={{ color: '#b3a6ff' }}>Solagene Nayancode · The software of Solagene</p>
            <h1 id="nc-hero" className="t-display" style={{ fontSize: 'clamp(2.6rem, 1.6rem + 3.6vw, 4.6rem)' }}>See the biology <span className="grad-text">in your data.</span></h1>
            <p className="lede">{DIVISIONS.nayancode.line} Nine analysis studios, a gene atlas, a report builder and {TOOLS.length} free tools. No installation, no account, and your files are never uploaded.</p>
            <div className="inline"><Link to="/workbench" className="button button--grad button--lg"><I.Grid width={18} height={18} />Launch the Workbench</Link><Link to="/nayancode/demo" className="button button--secondary button--lg">Request a demo</Link></div>
            <dl className="nc-stats"><div><dt>Analysis studios</dt><dd><CountUp to={STUDIOS.length} /></dd></div><div><dt>Products</dt><dd><CountUp to={PRODUCTS.length} /></dd></div><div><dt>Free tools</dt><dd><CountUp to={TOOLS.length} /></dd></div><div><dt>Bytes of your data uploaded</dt><dd>0</dd></div></dl>
          </div>
          <Reveal className="nc-hero-shot"><div className="shot-frame"><div className="bar"><i /><i /><i /></div><img src={asset(wb.shot)} alt="Nayancode Workbench overview" width={1280} height={800} /></div><div className="nc-float nc-float--a"><I.Lock width={14} height={14} />Runs locally</div><div className="nc-float nc-float--b"><I.Cpu width={14} height={14} />WebAssembly</div></Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="prod-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--nc">Products</p><h2 id="prod-h">A complete scientific toolkit</h2></div><Link to="/nayancode/products" className="button button--secondary">All products <I.Arrow /></Link></Reveal>
          <div className="ptabs" role="tablist" aria-label="Product lines">{ids.map((x) => <button key={x} type="button" role="tab" aria-selected={line === x} tabIndex={line === x ? 0 : -1} onClick={() => setLine(x)} onKeyDown={(e) => tabKeys(e, ids as unknown as string[], line, (v) => setLine(v as typeof line))}>{x}<span className="ct">{x === 'All' ? PRODUCTS.length : PRODUCTS.filter((p) => p.line === x).length}</span></button>)}</div>
          <div className="cgrid tab-panel" key={line} style={{ marginTop: 24 }}>{list.map((p, i) => <ProductCard key={p.slug} p={p} index={i} />)}</div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="pr-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--nc">Principles</p><h2 id="pr-h">Software scientists can trust</h2></div><p className="lede">The same standards we teach at Vedicgen and apply in Solagene research services, built into every product.</p></Reveal>
          <div className="cgrid" style={{ ['--cols' as string]: 4 }}>{PRINCIPLES.map(({ Ic, t, d }, i) => <Reveal key={t} index={i} className="ccard-wrap"><div className="ccard" style={{ ['--accent' as string]: 'var(--violet)' }}><span className="icon-tile" style={{ background: 'var(--violet-tint)', color: 'var(--violet-ink)' }}><Ic width={20} height={20} /></span><h3>{t}</h3><p>{d}</p></div></Reveal>)}</div>
        </div>
      </section>

      <section className="section" aria-labelledby="lic-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker kicker--nc">Licensing</p><h2 id="lic-h">Free to use. Ready for institutions.</h2></div><Link to="/nayancode/pricing" className="button button--secondary">Licensing details <I.Arrow /></Link></Reveal>
          <div className="price-cards">{LICENSING.map((l, i) => <Reveal key={l.name} index={i} className={`price-card ${i === 0 ? 'is-feat' : ''}`} style={{ ['--accent' as string]: 'var(--violet)' }}>{i === 0 && <span className="price-flag">Available now</span>}<p className="label">{l.name}</p><div className="price-row" style={{ borderTop: 0, paddingTop: 0 }}><b>{l.price}</b><small>{l.for}</small></div><ul className="checks small">{l.points.map((p) => <li key={p}>{p}</li>)}</ul><Link to={l.cta.to} className={`button ${i === 0 ? 'button--accent' : 'button--secondary'} button--sm`}>{l.cta.label} <I.Arrow width={15} height={15} /></Link></Reveal>)}</div>
        </div>
      </section>

      <section className="section on-ink section--ink" aria-labelledby="road-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker" style={{ color: '#b3a6ff' }}>Roadmap</p><h2 id="road-h" style={{ color: '#fff' }}>In development</h2></div><p className="lede" style={{ color: '#c3cce4' }}>Products we are building. They are not available yet and no release dates are announced.</p></Reveal>
          <div className="cgrid" style={{ ['--cols' as string]: 4 }}>{ROADMAP.map((r, i) => <Reveal key={r.name} index={i} className="road"><span className="st st--planned">{r.stage}</span><h3>{r.name}</h3><p>{r.body}</p></Reveal>)}</div>
        </div>
      </section>

      <section className="section" aria-labelledby="free-h">
        <div className="container split-5-7 align-center">
          <Reveal className="stack-md"><p className="kicker kicker--nc">Free online tools</p><h2 id="free-h">{TOOLS.length} quick calculators, one click away</h2><p className="lede">GC content, reverse complement, translation, ORFs, alignment, restriction sites, protein molecular weight and pI, FASTA validation and primer Tm, each with an explanation of the method.</p><div className="inline"><Link to="/nayancode/tools" className="button button--accent">Browse free tools <I.Arrow /></Link></div></Reveal>
          <Reveal index={1} className="tool-tiles">{TOOLS.slice(0, 8).map((t) => <Link key={t.slug} to={`/nayancode/tools/${t.slug}`}><span className="mono">{t.glyph}</span><b>{t.name}</b></Link>)}</Reveal>
        </div>
      </section>

      <FaqSection items={FAQ} alt />
      <section className="section section--tight"><div className="container"><Reveal className="cta-band cta-band--nc"><div><p className="kicker kicker--nc">Get started</p><h2>Open the Workbench and start an analysis now.</h2><p>Or talk to us about classroom use, self-hosting or custom software: <a className="ulink" href={`mailto:${BRAND.emails.support}`}>{BRAND.emails.support}</a></p></div><div className="inline"><Link to="/workbench" className="button button--accent button--lg"><I.Grid width={17} height={17} />Launch the Workbench</Link><Link to="/nayancode/demo" className="button button--secondary button--lg">Request a demo</Link></div></Reveal></div></section>
    </>
  );
}
