import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BRAND, DIVISIONS, TEAM, addressLines, mapUrl, otherLocations } from '@/core/brand';
import { SubMark, SolageneMark } from '../brand';
import { COURSES, INTERNSHIPS, PRODUCTS, SERVICES } from '../data/lite';
import { PROGRAMS } from '../data/programs';
import { RESEARCH } from '../data/research';
import Form, { F, QUALIFICATIONS, type Inbox } from '../Form';
import { I } from '../icons';
import { Link } from '../Link';
import { PageHeader, Reveal, tabKeys } from '../primitives';
import { CountUp } from '../ui';

const VALUES = [
  { Ic: I.Shield, t: 'Rigour you can check', d: 'Methods are validated against known answers, documented and reproducible, whether we teach them, run them for clients or ship them in software.' },
  { Ic: I.Flask, t: 'Bench and code together', d: 'We believe the best life scientists understand both the experiment and the data. Everything we do connects the two.' },
  { Ic: I.Users, t: 'Honest with learners and clients', d: 'Published fees, clear selection criteria, labelled capabilities and no promises of jobs, publications or results we cannot control.' },
  { Ic: I.Lock, t: 'Privacy by design', d: 'Our software analyses data on your own device, and client data are used only for the agreed project.' },
];

export function About() {
  return (
    <>
      <section className="dhero dhero--about on-ink" aria-labelledby="about-h">
        <div className="container dhero-grid">
          <div className="dhero-copy">
            <p className="kicker" style={{ color: '#7fe3c4' }}>About {BRAND.name}</p>
            <h1 id="about-h" className="t-display" style={{ fontSize: 'clamp(2.4rem, 1.5rem + 3.2vw, 4.2rem)', color: '#fff' }}>A computational life-science company, built to be checked.</h1>
            <p className="lede" style={{ color: '#c3cce4' }}>{BRAND.name} uses machine learning, physics-based simulation and multi-omics data to find drug targets and design candidate medicines. The same team runs Vedicgen, a school for wet-lab and computational scientists, and Nayancode, our analysis software.</p>
          </div>
          <Reveal className="about-mark"><SolageneMark size={220} /><p className="small" style={{ color: '#a7b2cf', textAlign: 'center' }}>Science · Software · Education</p></Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="mv-h">
        <div className="container">
          <div className="mv">
            <Reveal className="mv-card"><p className="kicker">Mission</p><h2 id="mv-h">Turn biology and computation into medicines that reach patients sooner.</h2></Reveal>
            <Reveal index={1} className="mv-card mv-card--alt"><p className="kicker kicker--nc">Vision</p><h2>A discovery culture where every prediction is checked against physics and the assay, and every result can be reproduced.</h2></Reveal>
          </div>
        </div>
      </section>

      <section className="section section--grad" aria-labelledby="arch-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">How we are organised</p><h2 id="arch-h">One company. Science first. Two arms that support it.</h2></div><p className="lede">{BRAND.name} is the company, and its science is the main work. Vedicgen is our school and Nayancode is our software: both are part of {BRAND.name} and both are open to the public.</p></Reveal>
          <div className="arch">
            <Reveal className="arch-root"><SolageneMark size={44} /><div><b>{BRAND.name}</b><span>{BRAND.tagline}</span></div></Reveal>
            <div className="arch-kids">
              <Reveal index={1} className="ccard-wrap"><Link to="/science" className="arch-kid arch-kid--vf"><span className="submark" style={{ background: 'linear-gradient(135deg,#1f6fe0,#4f8bff)' }}><I.Microscope width={22} height={22} /></span><b>Solagene Science & Solutions</b><span className="arch-role">Core</span><p>Generative AI and physics-based drug discovery, multi-omics, target discovery and contract services for biopharma partners.</p><small>6 focus areas · {SERVICES.length} services · {RESEARCH.length} research areas</small></Link></Reveal>
              <Reveal index={2} className="ccard-wrap"><Link to="/vedicgen" className="arch-kid arch-kid--vg"><SubMark div="vedicgen" size={22} /><b>Solagene Vedicgen</b><span className="arch-role">School</span><p>{DIVISIONS.vedicgen.line}</p><small>{COURSES.length} courses · {PROGRAMS.length} programmes · {INTERNSHIPS.length} internships</small></Link></Reveal>
              <Reveal index={3} className="ccard-wrap"><Link to="/nayancode" className="arch-kid arch-kid--nc"><SubMark div="nayancode" size={22} /><b>Solagene Nayancode</b><span className="arch-role">Software</span><p>{DIVISIONS.nayancode.line}</p><small>{PRODUCTS.length} products · free during the public preview</small></Link></Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="val-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">What we believe</p><h2 id="val-h">Principles behind every analysis, course and release.</h2></div></Reveal>
          <div className="cgrid" style={{ ['--cols' as string]: 4 }}>{VALUES.map(({ Ic, t, d }, i) => <Reveal key={t} index={i} className="ccard-wrap"><div className="ccard"><span className="icon-tile"><Ic width={20} height={20} /></span><h3>{t}</h3><p>{d}</p></div></Reveal>)}</div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="num-h">
        <div className="container">
          <Reveal className="band-head"><div><p className="kicker">{BRAND.name} today</p><h2 id="num-h">Built in the open, measured honestly.</h2></div></Reveal>
          <div className="stat-row" style={{ ['--n' as string]: 5 }}>
            <div><b><CountUp to={COURSES.length} /></b><span>courses across four schools</span></div>
            <div><b><CountUp to={INTERNSHIPS.length} /></b><span>internship tracks</span></div>
            <div><b><CountUp to={SERVICES.length} /></b><span>research services</span></div>
            <div><b><CountUp to={PRODUCTS.length} /></b><span>software products</span></div>
            <div><b><CountUp to={RESEARCH.length} /></b><span>research areas</span></div>
          </div>
        </div>
      </section>

      {TEAM.length > 0 && (
        <section className="section" aria-labelledby="team-h">
          <div className="container">
            <Reveal className="band-head"><div><p className="kicker">Leadership</p><h2 id="team-h">The people behind {BRAND.name}</h2></div></Reveal>
            <div className="cgrid">{TEAM.map((m, i) => <Reveal key={m.name} index={i} className="ccard-wrap"><div className="ccard team">{m.photo && <img src={m.photo} alt={`Portrait of ${m.name}`} width={400} height={400} loading="lazy" />}<h3>{m.name}</h3><p className="small subtle">{m.role}</p><p>{m.bio}</p>{m.links && <div className="inline">{m.links.map((l) => <a key={l.url} href={l.url} className="ulink small" target="_blank" rel="noopener noreferrer">{l.label}</a>)}</div>}</div></Reveal>)}</div>
          </div>
        </section>
      )}

      <section className="section" aria-label="Get in touch">
        <div className="container ctatrio">
          <Reveal className="ccard-wrap"><Link to="/vedicgen" className="cta-card cta-card--learn"><I.Book width={28} height={28} /><h3>Study with Vedicgen</h3><p>Wet-lab and dry-lab courses, programmes and internships.</p><span className="ccard-go">Explore Vedicgen <I.Arrow width={15} height={15} /></span></Link></Reveal>
          <Reveal index={1} className="ccard-wrap"><Link to="/nayancode" className="cta-card cta-card--build"><I.Code width={28} height={28} /><h3>Use Nayancode</h3><p>Scientific software that runs privately in your browser.</p><span className="ccard-go">Explore Nayancode <I.Arrow width={15} height={15} /></span></Link></Reveal>
          <Reveal index={2} className="ccard-wrap"><Link to="/contact" className="cta-card cta-card--work"><I.Mail width={28} height={28} /><h3>Talk to {BRAND.name}</h3><p>Partnerships, research services, media or anything else.</p><span className="ccard-go">Contact us <I.Arrow width={15} height={15} /></span></Link></Reveal>
        </div>
      </section>
    </>
  );
}

type Tab = 'general' | 'help' | 'support';
const TABS: { id: Tab; t: string; d: string; Ic: typeof I.Mail }[] = [
  { id: 'general', t: 'General & services', d: 'Partnerships, research services, quotes, media and anything else.', Ic: I.Microscope },
  { id: 'help', t: 'Admissions & help', d: 'Courses, programmes, internships, workshops, fees and certificates.', Ic: I.Book },
  { id: 'support', t: 'Software support', d: 'Nayancode products, demos, classroom use and technical help.', Ic: I.Code },
];

export function Contact() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>('general');
  useEffect(() => { const t = params.get('to'); if (t === 'help' || t === 'support' || t === 'general') setTab(t); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const ids = TABS.map((x) => x.id);
  const lines = addressLines();
  const fields = {
    general: [F.name, F.email, F.org, F.phone, { name: 'topic', label: 'Topic', type: 'select', required: true, options: ['Drug-discovery partnership or pilot', 'Research services or a quote', 'Partnership or collaboration', 'Careers', 'Media', 'Something else'] }, F.message('Message', 'How can we help?'), F.consent],
    help: [F.name, F.email, F.phoneReq, { name: 'qualification', label: 'Highest qualification', type: 'select', half: true, options: QUALIFICATIONS }, { name: 'topic', label: 'Topic', type: 'select', required: true, half: true, options: ['Choosing a course', 'Internships', 'Fees and payment', 'Certificates', 'Workshops or institutions', 'Something else'] }, F.message('Your question', 'Tell us what you would like to know.'), F.consent],
    support: [F.name, F.email, F.org, { name: 'product', label: 'Product', type: 'select', half: true, options: ['Whole Workbench', ...PRODUCTS.slice(1).map((p) => p.name.replace('Nayancode ', '')), 'Free online tools'] }, { name: 'topic', label: 'Topic', type: 'select', required: true, options: ['Technical problem', 'How do I…?', 'Demo or classroom use', 'Licensing', 'Feature request'] }, F.message('Details', 'What happened, your browser and system, and steps to reproduce.'), F.consent],
  } as Record<Tab, Parameters<typeof Form>[0]['fields']>;
  return (
    <>
      <PageHeader crumbs={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} label={`Contact ${BRAND.name}`} title="Let’s talk."
        lede={`Choose the team you need and your message goes straight to the right inbox. We reply within two working days.`} />
      <section className="section" aria-label="Inboxes">
        <div className="container">
          <div className="inbox-grid">{TABS.map(({ id, t, d, Ic }, i) => <Reveal key={id} index={i} className="ccard-wrap"><a href={`mailto:${BRAND.emails[id]}`} className="inbox"><span className="icon-tile"><Ic width={20} height={20} /></span><b>{t}</b><span className="inbox-mail">{BRAND.emails[id]}</span><p>{d}</p></a></Reveal>)}</div>
        </div>
      </section>
      <section className="section section--alt" aria-labelledby="form-h">
        <div className="container split-4-8 align-start">
          <div className="rail-head"><p className="kicker">Write to us</p><h2 id="form-h">Send a message</h2><p className="muted">Pick a team; the form adapts and is delivered to that team’s inbox.</p>{BRAND.phone && <p><a href={`tel:${BRAND.phone.replace(/[^\d+]/g, '')}`} className="textlink"><I.Phone width={15} height={15} />{BRAND.phone}</a></p>}</div>
          <div className="form-card">
            <div className="ptabs" role="tablist" aria-label="Team" style={{ marginBottom: 24 }}>{TABS.map((x) => <button key={x.id} type="button" role="tab" aria-selected={tab === x.id} tabIndex={tab === x.id ? 0 : -1} onClick={() => setTab(x.id)} onKeyDown={(e) => tabKeys(e, ids, tab, setTab)}>{x.t}</button>)}</div>
            <div className="tab-panel" key={tab} role="tabpanel"><Form kind={`Contact: ${TABS.find((x) => x.id === tab)!.t}`} inbox={tab as Inbox} subject={(v) => `[${TABS.find((x) => x.id === tab)!.t}] ${v.topic ?? 'Message'}: ${v.name}`} submitLabel="Send message" fields={fields[tab]} /></div>
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="addr-h">
        <div className="container visit visit--end">
          <Reveal className="ccard-wrap"><a href={mapUrl()} target="_blank" rel="noopener noreferrer" className="mapcard" aria-label={`Open ${BRAND.name}’s address in Google Maps`}><span className="pin" /><b>{BRAND.name}</b><span>Open in Google Maps <I.External width={13} height={13} /></span></a></Reveal>
          <Reveal index={1} className="visit-card"><p className="label" id="addr-h">Our offices</p><address>{lines.map((l, i) => <span key={i}>{l}</span>)}</address>{otherLocations().map((o) => <address key={o.label} className="office"><span className="office-label">{o.label} office</span>{o.lines.map((l, i) => <span key={i}>{l}</span>)}{o.line1 && <a href={o.map} target="_blank" rel="noopener noreferrer" className="textlink small">Open in Google Maps</a>}</address>)}{BRAND.hours && <p className="small subtle">{BRAND.hours}</p>}</Reveal>
          <Reveal index={2} className="visit-card"><p className="label">E-mail</p>{TABS.map((x) => <div key={x.id} className="mail"><small>{x.t}</small><a href={`mailto:${BRAND.emails[x.id]}`}>{BRAND.emails[x.id]}</a></div>)}</Reveal>
        </div>
      </section>
    </>
  );
}
