import { BRAND } from '@/core/brand';
import { ArticleRow } from '../blocks';
import { SubMark } from '../brand';
import { HOME_FAQ } from '../data/faq';
import { FOCUS, LANDSCAPE, SOLUTION_GROUPS, SOLUTIONS } from '../data/focus';
import { ARTICLES, COURSES, TOOLS } from '../data/lite';
import { RESEARCH } from '../data/research';
import FoldField from '../FoldField';
import { I } from '../icons';
import { Link } from '../Link';
import { CtaBand, FaqSection, Reveal } from '../primitives';
import { DiscoveryLoop } from '../Visuals';

function Hero() {
  return (
    <section className="vhero on-ink" aria-labelledby="hero-h">
      <div className="container">
        <div className="vhero-grid">
          <div className="vhero-copy intro-rise">
            <p className="kicker">Computational biotechnology</p>
            <h1 id="hero-h" className="t-display">We find drug targets and design medicines with computation.</h1>
            <p className="lede">{BRAND.name} combines machine learning, physics-based simulation and multi-omics data to identify targets, design small molecules and biologics, and build the analysis platforms that discovery teams rely on.</p>
            <div className="inline">
              <Link to="/science" className="button button--primary button--lg">Our science <I.Arrow /></Link>
              <Link to="/contact" className="button button--secondary button--lg">Work with us</Link>
            </div>
            <div className="vhero-divs" aria-label="Also from Solagene">
              <span className="vhero-also">Also from {BRAND.name}</span>
              <Link to="/vedicgen" className="vhero-div"><SubMark div="vedicgen" size={18} /><span>Vedicgen<small>School</small></span></Link>
              <Link to="/nayancode" className="vhero-div"><SubMark div="nayancode" size={18} /><span>Nayancode<small>Software</small></span></Link>
            </div>
          </div>
          <div className="vhero-visual" aria-hidden><FoldField /></div>
        </div>
      </div>
    </section>
  );
}

function FocusList() {
  return (
    <section className="section" aria-labelledby="focus-h">
      <div className="container split-l">
        <Reveal className="split-l-head">
          <p className="kicker">Areas of work</p>
          <h2 id="focus-h">Six areas, one set of methods.</h2>
          <p className="muted">Shared data infrastructure, models and simulation tools run through every area, so a finding in one can be tested quickly in another.</p>
          <Link to="/science" className="textlink">Read about our science <I.Arrow width={15} height={15} /></Link>
        </Reveal>
        <ol className="flist">
          {FOCUS.map((f) => (
            <li key={f.slug}><Link to={`/science#${f.slug}`} className="flist-row">
              <span className="flist-n">{f.n}</span>
              <span className="flist-t"><b>{f.title}</b><span>{f.short}</span></span>
              <I.Arrow width={18} height={18} />
            </Link></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function LoopBand() {
  return (
    <section className="section on-ink section--ink" aria-labelledby="loop-h">
      <div className="container col2 align-center">
        <Reveal className="stack-md">
          <p className="kicker">Method</p>
          <h2 id="loop-h">Each design cycle starts from what the last one learned.</h2>
          <p className="lede">Generative models propose candidates, fast learned filters remove most of them, physics-based simulation ranks the shortlist and the assay has the final word. Its results go back into the models before the next round.</p>
          <div className="inline"><Link to="/science" className="button button--primary">How we work <I.Arrow /></Link></div>
        </Reveal>
        <Reveal index={1} className="dhero-visual"><DiscoveryLoop /></Reveal>
      </div>
    </section>
  );
}

function SolutionsBand() {
  return (
    <section className="section" aria-labelledby="sol-h">
      <div className="container">
        <Reveal className="band-head"><div><p className="kicker">For partners</p><h2 id="sol-h">From a single analysis to a multi-year programme.</h2></div><Link to="/solutions" className="button button--secondary">All solutions <I.Arrow /></Link></Reveal>
        <div className="cols3">
          {SOLUTION_GROUPS.map((g) => (
            <Reveal key={g.id} className="cols3-col">
              <h3>{g.title}</h3>
              <ul>{SOLUTIONS.filter((x) => x.group === g.id).map((x) => <li key={x.slug}><Link to={x.to}>{x.title}</Link></li>)}</ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandscapeBand() {
  return (
    <section className="section section--alt" aria-labelledby="land-h">
      <div className="container">
        <Reveal className="band-head"><div><p className="kicker">Industry landscape</p><h2 id="land-h">What the market is telling us in 2026.</h2></div><Link to="/industry" className="button button--secondary">Read the full note <I.Arrow /></Link></Reveal>
        <div className="notes">{LANDSCAPE.slice(0, 3).map((f) => <Reveal key={f.title} className="note"><span className="land-tag">{f.tag}</span><h3>{f.title}</h3><p>{f.text}</p><a href={f.url} target="_blank" rel="noopener noreferrer" className="textlink small">{f.src} <I.External width={13} height={13} /></a></Reveal>)}</div>
      </div>
    </section>
  );
}

function ResearchBand() {
  return (
    <section className="section" aria-labelledby="res-h">
      <div className="container split-l">
        <Reveal className="split-l-head"><p className="kicker">Research</p><h2 id="res-h">The questions behind our methods.</h2><Link to="/research" className="textlink">All research areas <I.Arrow width={15} height={15} /></Link></Reveal>
        <ol className="flist">{RESEARCH.map((r, i) => (
          <li key={r.slug}><Link to={`/research/${r.slug}`} className="flist-row">
            <span className="flist-n">{String(i + 1).padStart(2, '0')}</span>
            <span className="flist-t"><b>{r.title}</b><span>{r.short}</span></span>
            <I.Arrow width={18} height={18} />
          </Link></li>
        ))}</ol>
      </div>
    </section>
  );
}

function FamilyBand() {
  return (
    <section className="section section--alt" aria-labelledby="fam-h">
      <div className="container">
        <Reveal className="band-head"><div><p className="kicker">Also from {BRAND.name}</p><h2 id="fam-h">Training and software, run by the same team.</h2></div></Reveal>
        <div className="famrow">
          <Reveal className="ccard-wrap"><Link to="/vedicgen" className="fam fam--vg"><b>Vedicgen</b><span>Our school. {COURSES.length} wet-lab and computational courses, professional programmes and mentored internships for students and working scientists.</span><span className="ccard-go">Visit Vedicgen <I.Arrow width={15} height={15} /></span></Link></Reveal>
          <Reveal index={1} className="ccard-wrap"><Link to="/nayancode" className="fam fam--nc"><b>Nayancode</b><span>Our software. Eleven analysis studios and {TOOLS.length} free tools that run in the browser, so research data never leaves the user’s computer.</span><span className="ccard-go">Visit Nayancode <I.Arrow width={15} height={15} /></span></Link></Reveal>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <FocusList />
      <LoopBand />
      <SolutionsBand />
      <LandscapeBand />
      <ResearchBand />
      <FamilyBand />
      <section className="section" aria-labelledby="learn-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">Knowledge hub</p><h2 id="learn-h">Practical guides from the people who run the analyses.</h2></div><Link to="/learn" className="button button--secondary">All guides <I.Arrow /></Link></Reveal>
          <div className="index">{ARTICLES.slice(0, 5).map((a, i) => <ArticleRow key={a.slug} a={a} index={i} />)}</div>
        </div>
      </section>
      <FaqSection items={HOME_FAQ} alt />
      <CtaBand label="Contact" title="Tell us what you need to decide." body="Describe your target, dataset or question. We reply within two working days with a proposed approach." actions={<><Link to="/contact" className="button button--primary button--lg">Contact the team <I.Arrow /></Link><Link to="/solutions" className="button button--secondary button--lg">See solutions</Link></>} />
    </>
  );
}
