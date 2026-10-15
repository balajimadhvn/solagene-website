import { BRAND } from '@/core/brand';
import { FOCUS, IMPLICATIONS, LANDSCAPE, LANDSCAPE_CAUTION, SOLUTION_GROUPS, SOLUTIONS } from '../data/focus';
import { I } from '../icons';
import { Link } from '../Link';
import { CtaBand, FaqSection, PageHeader, Reveal } from '../primitives';
import { DiscoveryLoop, Funnel, PillarGlyph } from '../Visuals';


const MODALITIES = ['Small molecules', 'Proteins & biologics', 'Antibody–drug conjugates', 'mRNA medicines', 'Cell & gene therapy', 'Targeted degraders'];
const STEPS = [
  { t: 'Scope', d: 'We agree the target, the product profile, the data you hold and what a good answer looks like.' },
  { t: 'Pilot', d: 'A short, fixed-scope pilot on your data, with the method and the uncertainty written down.' },
  { t: 'Deliver', d: 'Ranked results, code, models and a methods section your team can rerun and defend.' },
  { t: 'Iterate', d: 'Assay results go back into the models, and the next cycle starts from what was learned.' },
];
const SCIENCE_FAQ = [
  { q: 'How do you work with partners?', a: 'Most engagements begin with a short, fixed-scope pilot on the partner’s own question and data. If the pilot is useful, it becomes a longer programme with agreed milestones. Methods, code and models are documented so that your team can rerun and audit them.' },
  { q: 'Do you work on our confidential targets and data?', a: 'Yes, under a confidentiality agreement. Partner data, and models trained on it, are used only for that partner’s programme.' },
  { q: 'How do Vedicgen and Nayancode fit in?', a: 'Vedicgen is our school and Nayancode is our scientific software. They are part of the same company: Vedicgen trains the people who do this work, and Nayancode is the software we build for it, including free tools you can use today.' },
  { q: 'Can I use your software and training without a partnership?', a: 'Yes. The Nayancode Workbench and free tools are open to anyone, and Vedicgen courses and internships take applications from students and professionals.' },
];

export function Science() {
  return (
    <>
      <section className="dhero dhero--sci on-ink" aria-labelledby="sci-h">
        <div className="container dhero-grid">
          <div className="dhero-copy">
            <p className="kicker">Science</p>
            <h1 id="sci-h" className="t-display" style={{ fontSize: 'clamp(2.3rem, 1.4rem + 3vw, 3.9rem)', maxWidth: '18ch' }}>Computation decides which experiments are worth running.</h1>
            <p className="lede">{BRAND.name} works where discovery is most expensive to get wrong: which target to pursue, which molecule to make and which patients will respond. We combine machine learning, physics-based simulation and multi-omics data, and every recommendation comes with the evidence and the uncertainty behind it.</p>
            <div className="inline"><Link to="/solutions" className="button button--primary button--lg">Work we take on <I.Arrow /></Link><Link to="/contact" className="button button--secondary button--lg">Contact the team</Link></div>
          </div>
          <div className="dhero-visual"><DiscoveryLoop /></div>
        </div>
      </section>

      <section className="section" aria-labelledby="focus-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Areas of work</p><h2 id="focus-h">Six areas, one set of methods.</h2></div><p className="lede">The same data infrastructure, models and simulation tools run through all of them, so an insight in one area can be tested quickly in another.</p></Reveal>
          <ol className="fareas">
            {FOCUS.map((f, i) => (
              <Reveal as="li" key={f.slug} index={i % 3} id={f.slug} className="farea">
                <div className="farea-gl"><PillarGlyph kind={f.glyph} /><span className="farea-n">{f.n}</span></div>
                <div className="farea-main">
                  <span className="kicker">{f.kicker}</span>
                  <h3>{f.title}</h3>
                  <p className="muted">{f.short}</p>
                  <p className="farea-links">{f.links.map((l) => <Link key={l.to + l.label} to={l.to} className="textlink small">{l.label} <I.Arrow width={14} height={14} /></Link>)}</p>
                </div>
                <ul className="farea-caps farea-side">{f.capabilities.map((c) => <li key={c}>{c}</li>)}</ul>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="funnel-h">
        <div className="container col2 align-center">
          <Reveal className="stack-sm"><p className="kicker">How a campaign narrows</p><h2 id="funnel-h">Most ideas should fail early, and cheaply.</h2><p className="muted">Fast learned models remove most candidates at little cost. Rigorous physics is reserved for the shortlist, where accuracy changes the decision. Assay results then return to the models, so the next round starts from what the last one taught us.</p></Reveal>
          <Reveal index={1}><Funnel /></Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="mod-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Modalities</p><h2 id="mod-h">One platform across modalities</h2></div><p className="lede">The same data, simulation and learning infrastructure supports programmes across modalities. Detail for each programme is shared with partners under confidentiality.</p></Reveal>
          <Reveal className="modrow">{MODALITIES.map((m, i) => <span key={m} className="modchip" style={{ ['--i' as string]: i }}>{m}</span>)}</Reveal>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="how-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Working with us</p><h2 id="how-h">A pilot first, then a programme</h2></div></Reveal>
          <ol className="steps steps--inline" style={{ ['--n' as string]: 4 }}>{STEPS.map((s) => <li key={s.t}><h3>{s.t}</h3><p>{s.d}</p></li>)}</ol>
        </div>
      </section>

      <section className="section" aria-labelledby="fam-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Also from Vivofold</p><h2 id="fam-h">The people and the software behind the science</h2></div></Reveal>
          <div className="famrow">
            <Reveal className="ccard-wrap"><Link to="/vedicgen" className="fam fam--vg"><b>Vedicgen</b><span>Our school: wet-lab and dry-lab courses, internships and research training.</span><span className="ccard-go">Visit Vedicgen <I.Arrow width={15} height={15} /></span></Link></Reveal>
            <Reveal index={1} className="ccard-wrap"><Link to="/nayancode" className="fam fam--nc"><b>Nayancode</b><span>Our software: nine analysis studios and free tools that run privately in your browser.</span><span className="ccard-go">Visit Nayancode <I.Arrow width={15} height={15} /></span></Link></Reveal>
          </div>
        </div>
      </section>
      <FaqSection items={SCIENCE_FAQ} alt />
      <CtaBand label="Partner with Vivofold" title="Bring us a target, a dataset or a question." body="Tell us what you need to decide. We reply with a proposed pilot, a timeline and a fixed price." actions={<><Link to="/contact" className="button button--primary button--lg">Start a conversation <I.Arrow /></Link><Link to="/solutions" className="button button--secondary button--lg">See solutions</Link></>} />
    </>
  );
}

export function Solutions() {
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Solutions', path: '/solutions' }]} label="Solutions" title="Work we take on for partners"
        lede="Computational discovery, clinical and translational genomics, and the infrastructure underneath them. Engagements range from a single analysis to a multi-year programme, and most begin with a fixed-scope pilot."
        actions={<><Link to="/contact" className="button button--primary button--lg">Request a proposal <I.Arrow /></Link><Link to="/services" className="button button--secondary button--lg">Standard services</Link></>} />
      {SOLUTION_GROUPS.map((g, gi) => (
        <section key={g.id} className={`section ${gi % 2 ? 'section--alt' : ''}`} aria-labelledby={`sg-${g.id}`}>
          <div className="container">
            <Reveal className="band-head"><div><p className="kicker">{String(gi + 1).padStart(2, '0')}</p><h2 id={`sg-${g.id}`}>{g.title}</h2></div><p className="lede">{g.lede}</p></Reveal>
            <div className="solgrid">
              {SOLUTIONS.filter((s) => s.group === g.id).map((s, i) => (
                <Reveal key={s.slug} index={i % 3} className="ccard-wrap"><Link to={s.to} className="sol">
                                    <h3>{s.title}</h3><p>{s.short}</p>
                  <span className="ccard-go">{s.cta} <I.Arrow width={15} height={15} /></span>
                </Link></Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}
      <section className="section" aria-labelledby="sol-note">
        <div className="container"><Reveal className="notice"><I.Shield width={18} height={18} /><span id="sol-note"><b>Research use.</b> Vivofold analyses support research and development. They are not medical devices and are not used for clinical decisions about individual patients. Variant and pharmacogenomic work is delivered for research cohorts and trial sub-studies, with its method documented.</span></Reveal></div>
      </section>
      <CtaBand label="Next step" title="Tell us what you are trying to decide." body="We reply with a scoped pilot, a timeline and a fixed price." actions={<><Link to="/contact" className="button button--primary button--lg">Contact Vivofold <I.Arrow /></Link><Link to="/science" className="button button--secondary button--lg">Our science</Link></>} />
    </>
  );
}

export function Industry() {
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Industry landscape', path: '/industry' }]} label="Industry landscape · October 2026" title="Where AI drug discovery and bioinformatics are heading"
        lede="A short reading of the market: what large pharmaceutical companies are buying, which technical approaches are gaining ground and where capital is going. Every figure is attributed and linked to its source." />
      <section className="section" aria-labelledby="land-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Market signals</p><h2 id="land-h">Nine developments that shape our plans</h2></div></Reveal>
          <div className="landgrid">
            {LANDSCAPE.map((f, i) => (
              <Reveal key={f.title} index={i % 3} className="ccard-wrap"><article className="land">
                <span className="land-tag">{f.tag}</span><h3>{f.title}</h3><p>{f.text}</p>
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="textlink small">Source: {f.src} <I.External width={13} height={13} /></a>
              </article></Reveal>
            ))}
          </div>
          <Reveal className="notice notice--caution" style={{ marginTop: 28 }}><I.Alert width={18} height={18} /><span>{LANDSCAPE_CAUTION}</span></Reveal>
        </div>
      </section>
      <section className="section section--alt" aria-labelledby="imp-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">What it means for us</p><h2 id="imp-h">How we respond</h2></div></Reveal>
          <div className="solgrid">{IMPLICATIONS.map((x, i) => <Reveal key={x.t} index={i % 3} className="ccard-wrap"><div className="sol"><h3>{x.t}</h3><p>{x.d}</p></div></Reveal>)}</div>
        </div>
      </section>
      <CtaBand label="Next step" title="See how this applies to your programme." actions={<><Link to="/science" className="button button--primary button--lg">Our science <I.Arrow /></Link><Link to="/contact" className="button button--secondary button--lg">Contact us</Link></>} />
    </>
  );
}
