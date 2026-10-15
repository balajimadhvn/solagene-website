import { Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { BRAND, DIVISIONS, addressLines, mapUrl, otherLocations, type DivisionId } from '@/core/brand';
import { useUi } from '@/core/ui-store';
import { Logo, SubMark } from './brand';
import { SCHOOLS } from './data/course-types';
import { PRODUCT_LINES, SERVICE_CATEGORIES } from './data/labels';
import { COURSES, INTERNSHIPS, PRODUCTS, SERVICES, TOOLS } from './data/lite';
import { PROGRAMS } from './data/programs';
import { Newsletter } from './Form';
import { I } from './icons';
import { bare, Link, NavLink } from './Link';
import { prefetch } from './prefetch';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
type MenuId = 'vedicgen' | 'nayancode' | 'services';

/** Featured courses per school in the Vedicgen menu (first four of each school's featured list, else its first four). */
const menuCourses = (school: string) => {
  const all = COURSES.filter((c) => c.school === school);
  const feat = all.filter((c) => c.featured);
  return [...feat, ...all.filter((c) => !c.featured)].slice(0, 5);
};

/* ---------- desktop mega menus ---------- */
function VedicgenMega() {
  return (
    <div className="container mega-in mega-in--vg">
      {SCHOOLS.map((s) => (
        <div key={s.id} className="mega-col">
          <p className="label">{s.short}</p>
          {menuCourses(s.id).map((c) => <Link key={c.slug} to={`/vedicgen/courses/${c.slug}`} className="mega-link"><b>{c.title}</b><span>{c.discipline === 'wet' ? 'Wet lab · ' : c.discipline === 'hybrid' ? 'Wet + dry · ' : ''}{c.level}</span></Link>)}
          <Link to={`/vedicgen/courses?school=${s.id}`} className="textlink small mega-more">All {COURSES.filter((c) => c.school === s.id).length} courses <I.Arrow width={14} height={14} /></Link>
        </div>
      ))}
      <div className="mega-aside">
        <Logo div="vedicgen" size={26} />
        <p>{DIVISIONS.vedicgen.tagline} Courses, internships and research training in biotechnology, bioinformatics and the life sciences.</p>
        <ul className="mega-list">
          <li><Link to="/vedicgen/programs">Professional programmes <span>{PROGRAMS.length}</span></Link></li>
          <li><Link to="/vedicgen/internships">Internships <span>{INTERNSHIPS.length}</span></Link></li>
          <li><Link to="/vedicgen/workshops">Workshops</Link></li>
          <li><Link to="/vedicgen/research-training">Research training</Link></li>
          <li><Link to="/vedicgen/institutions">For institutions</Link></li>
          <li><Link to="/vedicgen/pricing">Fees & pricing</Link></li>
        </ul>
        <div className="inline"><Link to="/vedicgen/apply" className="button button--primary button--sm">Apply now <I.Arrow width={15} height={15} /></Link><Link to="/vedicgen" className="button button--ghost button--sm">Vedicgen home</Link></div>
      </div>
    </div>
  );
}
function NayancodeMega() {
  return (
    <div className="container mega-in mega-in--nc">
      {PRODUCT_LINES.filter((l) => l !== 'Knowledge & reporting').map((line) => (
        <div key={line} className="mega-col">
          <p className="label">{line}</p>
          {PRODUCTS.filter((p) => p.line === line || (line === 'Platform' && p.line === 'Knowledge & reporting')).map((p) => <Link key={p.slug} to={`/nayancode/products/${p.slug}`} className="mega-link"><b>{p.name.replace('Nayancode ', '')}</b><span>{p.tagline}</span></Link>)}
        </div>
      ))}
      <div className="mega-aside">
        <Logo div="nayancode" size={26} />
        <p>{DIVISIONS.nayancode.tagline} Scientific software that runs privately in your browser: free during the public preview.</p>
        <ul className="mega-list">
          <li><Link to="/nayancode/tools">Free online tools <span>{TOOLS.length}</span></Link></li>
          <li><Link to="/nayancode/docs">Documentation</Link></li>
          <li><Link to="/nayancode/pricing">Licensing</Link></li>
          <li><Link to="/nayancode/demo">Request a demo</Link></li>
        </ul>
        <div className="inline"><Link to="/workbench" className="button button--primary button--sm"><I.Grid width={15} height={15} />Open the Workbench</Link></div>
      </div>
    </div>
  );
}
function ServicesMega() {
  return (
    <div className="container mega-in mega-in--sv">
      {SERVICE_CATEGORIES.map((cat) => (
        <div key={cat} className="mega-col">
          <p className="label">{cat}</p>
          {SERVICES.filter((s) => s.category === cat).map((s) => <Link key={s.slug} to={`/services/${s.slug}`} className="mega-link"><b>{s.title}</b></Link>)}
        </div>
      ))}
      <div className="mega-foot"><Link to="/services" className="textlink">All research services <I.Arrow width={15} height={15} /></Link><Link to="/services#quote" className="textlink textlink--ink">Request a free quote</Link></div>
    </div>
  );
}

/* ---------- mobile navigation ---------- */
function MobileGroup({ title, i, children }: { title: ReactNode; i: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = `mnav-${i}`;
  return (
    <div className="mnav-group" style={{ ['--i' as string]: i }}>
      <button type="button" className="mnav-top" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>{title}<I.Chevron width={18} height={18} /></button>
      <div className={`mnav-sub ${open ? 'is-open' : ''}`} id={id}><div><ul>{children}</ul></div></div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="topbar on-ink">
      <div className="container topbar-in">
        <nav className="topbar-group" aria-label="Vivofold group">
          <Link to="/" className="tb-brand">{BRAND.name}</Link>
          <span className="tb-sep" aria-hidden>/</span>
          <Link to="/vedicgen"><SubMark div="vedicgen" size={14} />Vedicgen <span>Education</span></Link>
          <Link to="/nayancode"><SubMark div="nayancode" size={14} />Nayancode <span>Software</span></Link>
        </nav>
        <div className="topbar-meta">
          <Link to="/learn">Knowledge hub</Link>
          <a href={`mailto:${BRAND.emails.general}`}><I.Mail width={13} height={13} />{BRAND.emails.general}</a>
          <Link to="/workbench" className="tb-wb">Open the Workbench <I.External width={12} height={12} /></Link>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const loc = useLocation();
  const path = bare(loc.pathname);
  const [open, setOpen] = useState<MenuId | null>(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hdr = useRef<HTMLElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const btn = useRef<Partial<Record<MenuId, HTMLButtonElement | null>>>({});
  const timer = useRef(0);

  useEffect(() => { const f = () => setScrolled(window.scrollY > 40); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);
  useEffect(() => { setOpen(null); setMobile(false); }, [loc.pathname, loc.search, loc.hash]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open && !mobile) return;
    const down = (e: MouseEvent) => { if (open && !hdr.current?.contains(e.target as Node)) setOpen(null); };
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (open) { btn.current[open]?.focus(); setOpen(null); } else if (mobile) { setMobile(false); menuBtn.current?.focus(); }
    };
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open, mobile]);
  useEffect(() => {
    if (!mobile) return;
    const el = document.documentElement, prev = el.style.overflow;
    el.style.overflow = 'hidden';
    requestAnimationFrame(() => hdr.current?.querySelector<HTMLElement>('.mnav .mnav-top')?.focus({ preventScroll: true }));
    const mq = window.matchMedia('(min-width: 1180px)');
    const onMq = () => { if (mq.matches) setMobile(false); };
    mq.addEventListener('change', onMq);
    return () => { el.style.overflow = prev; mq.removeEventListener('change', onMq); };
  }, [mobile]);

  const on = (p: string) => path === p || path.startsWith(p + '/');
  const enter = (id: MenuId) => { clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(id), open ? 0 : 90); };
  const leave = () => { clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(null), 220); };
  const item = (id: MenuId, label: ReactNode, p: string, panel: ReactNode) => (
    <div className="nav-grp" onMouseEnter={() => enter(id)} onMouseLeave={leave} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen((o) => (o === id ? null : o)); }}>
      <button type="button" ref={(el) => { btn.current[id] = el; }} className={`nav-link ${on(p) ? 'is-active' : ''}`} aria-expanded={open === id} aria-controls={`mega-${id}`}
        onClick={() => { clearTimeout(timer.current); setOpen((o) => (o === id ? null : id)); }}
        onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(id); requestAnimationFrame(() => document.querySelector<HTMLElement>(`#mega-${id} a`)?.focus()); } }}>
        {label}<I.Chevron width={14} height={14} />
      </button>
      <div id={`mega-${id}`} className={`mega ${open === id ? 'is-open' : ''}`} onMouseEnter={() => clearTimeout(timer.current)}>{panel}</div>
    </div>
  );
  const link = (to: string, label: string) => <NavLink to={to} className={() => `nav-link ${on(to) ? 'is-active' : ''}`}>{label}</NavLink>;

  return (
    <header ref={hdr} className={`hdr ${scrolled ? 'is-scrolled' : ''} ${open || mobile ? 'is-open' : ''}`}>
      <div className="container hdr-in">
        <Logo to="/" size={36} />
        <nav className="nav" aria-label="Primary">
          {link('/science', 'Science')}
          {link('/solutions', 'Solutions')}
          {item('services', 'Services', '/services', <ServicesMega />)}
          {link('/research', 'Research')}
          {item('vedicgen', <><SubMark div="vedicgen" size={15} />Vedicgen<small className="nav-sub">School</small></>, '/vedicgen', <VedicgenMega />)}
          {item('nayancode', <><SubMark div="nayancode" size={15} />Nayancode<small className="nav-sub">Software</small></>, '/nayancode', <NayancodeMega />)}
          {link('/about', 'About')}
        </nav>
        <div className="hdr-right">
          <Link to="/workbench" className="button button--secondary button--sm hdr-wb" title="Open the Nayancode Workbench: nine analysis studios in your browser" aria-label="Open the Workbench"><I.Grid width={15} height={15} /><span>Workbench</span></Link>
          <Link to="/contact" className="button button--primary button--sm hdr-cta">Partner with us</Link>
          <button type="button" ref={menuBtn} className="button button--ghost button--icon hdr-menu" onClick={() => setMobile((v) => !v)} aria-expanded={mobile} aria-controls="mnav" aria-label={mobile ? 'Close menu' : 'Open menu'}>{mobile ? <I.X width={20} height={20} /> : <I.Menu width={20} height={20} />}</button>
        </div>
      </div>
      <div id="mnav" className={`mnav ${mobile ? 'is-open' : ''}`}>
        <nav className="container mnav-in" aria-label="Mobile">
          <div className="mnav-quick">
            <Link to="/contact" className="button button--primary button--lg button--block">Partner with us</Link>
            <Link to="/workbench" className="button button--secondary button--lg button--block"><I.Grid width={17} height={17} />Open the Workbench</Link>
          </div>
          {[['/science', 'Our science'], ['/solutions', 'Solutions']].map(([to, t], k) => <div key={to} className="mnav-group" style={{ ['--i' as string]: k }}><Link to={to} className="mnav-top">{t}<I.Arrow width={18} height={18} /></Link></div>)}
          <MobileGroup title={<span className="mnav-t"><SubMark div="vedicgen" size={18} />Vedicgen · School</span>} i={2}>
            <li><Link to="/vedicgen"><b>Vedicgen home</b></Link></li>
            <li><Link to="/vedicgen/courses">All {COURSES.length} courses</Link></li>
            {SCHOOLS.map((s) => <li key={s.id}><Link to={`/vedicgen/courses?school=${s.id}`}>{s.name}</Link></li>)}
            <li><Link to="/vedicgen/programs">Professional programmes</Link></li><li><Link to="/vedicgen/internships">Internships</Link></li><li><Link to="/vedicgen/workshops">Workshops</Link></li>
            <li><Link to="/vedicgen/research-training">Research training</Link></li><li><Link to="/vedicgen/institutions">For institutions</Link></li><li><Link to="/vedicgen/pricing">Fees & pricing</Link></li>
          </MobileGroup>
          <MobileGroup title={<span className="mnav-t"><SubMark div="nayancode" size={18} />Nayancode · Software</span>} i={3}>
            <li><Link to="/nayancode"><b>Nayancode home</b></Link></li>
            {PRODUCTS.map((p) => <li key={p.slug}><Link to={`/nayancode/products/${p.slug}`}>{p.name.replace('Nayancode ', '')}</Link></li>)}
            <li><Link to="/nayancode/tools">Free online tools</Link></li><li><Link to="/nayancode/docs">Documentation</Link></li><li><Link to="/nayancode/pricing">Licensing</Link></li><li><Link to="/nayancode/demo">Request a demo</Link></li>
          </MobileGroup>
          <MobileGroup title="Research services" i={4}>
            {SERVICES.map((s) => <li key={s.slug}><Link to={`/services/${s.slug}`}>{s.title}</Link></li>)}
            <li><Link to="/services"><b>All services</b></Link></li>
          </MobileGroup>
          {[['/research', 'Research'], ['/industry', 'Industry landscape'], ['/learn', 'Knowledge hub'], ['/about', 'About Vivofold'], ['/contact', 'Contact']].map(([to, t], k) => <div key={to} className="mnav-group" style={{ ['--i' as string]: k + 5 }}><Link to={to} className="mnav-top">{t}<I.Arrow width={18} height={18} /></Link></div>)}
          <div className="mnav-contact"><a href={`mailto:${BRAND.emails.general}`}>{BRAND.emails.general}</a></div>
        </nav>
      </div>
    </header>
  );
}

/* ---------- division sub-navigation ---------- */
const SUBNAV: Record<DivisionId, { links: [string, string][]; cta: [string, string]; cta2?: [string, string] }> = {
  vedicgen: { links: [['/vedicgen', 'Overview'], ['/vedicgen/courses', 'Courses'], ['/vedicgen/programs', 'Programmes'], ['/vedicgen/internships', 'Internships'], ['/vedicgen/workshops', 'Workshops'], ['/vedicgen/research-training', 'Research training'], ['/vedicgen/institutions', 'Institutions'], ['/vedicgen/pricing', 'Fees']], cta: ['/vedicgen/apply', 'Apply now'] },
  nayancode: { links: [['/nayancode', 'Overview'], ['/nayancode/products/workbench', 'Workbench'], ['/nayancode/products', 'Products'], ['/nayancode/tools', 'Free tools'], ['/nayancode/docs', 'Docs'], ['/nayancode/pricing', 'Licensing']], cta: ['/workbench', 'Launch Workbench'], cta2: ['/nayancode/demo', 'Request a demo'] },
};
function SubNav({ div }: { div: DivisionId }) {
  const loc = useLocation();
  const path = bare(loc.pathname);
  const cfg = SUBNAV[div];
  const active = (to: string) => (to === `/${div}` ? path === to : path === to || path.startsWith(to + '/'));
  return (
    <div className={`subnav subnav--${div}`}>
      <div className="container subnav-in">
        <Logo div={div} size={24} to={`/${div}`} className="subnav-logo" />
        <nav className="subnav-links" aria-label={`${DIVISIONS[div].name} sections`}>
          {cfg.links.map(([to, t]) => <Link key={to} to={to} className={active(to) ? 'is-active' : ''} aria-current={active(to) ? 'page' : undefined}>{t}</Link>)}
        </nav>
        <div className="subnav-cta">
          {cfg.cta2 && <Link to={cfg.cta2[0]} className="button button--ghost button--sm sm-hide">{cfg.cta2[1]}</Link>}
          <Link to={cfg.cta[0]} className="button button--accent button--sm">{div === 'nayancode' && <I.Grid width={14} height={14} />}{cfg.cta[1]}</Link>
        </div>
      </div>
    </div>
  );
}

/* ---------- footer ---------- */
function ThemeSwitch() {
  const { theme, setTheme } = useUi();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="seg theme-seg" role="group" aria-label="Colour theme">
      <button type="button" aria-pressed={mounted ? theme === 'light' : undefined} onClick={() => setTheme('light')}><I.Sun width={14} height={14} /> Light</button>
      <button type="button" aria-pressed={mounted ? theme === 'dark' : undefined} onClick={() => setTheme('dark')}><I.Moon width={14} height={14} /> Dark</button>
    </div>
  );
}

function Footer() {
  const lines = addressLines();
  return (
    <footer className="ftr on-ink">
      <div className="container">
        <div className="ftr-hero">
          <div className="stack-sm">
            <Logo to="/" size={44} tagline />
            <p className="ftr-tag">{BRAND.tagline}</p>
            <p className="ftr-lede">{BRAND.slogan}</p>
          </div>
          <div className="ftr-divs">
            <Link to="/vedicgen" className="ftr-div ftr-div--vg"><SubMark div="vedicgen" size={26} /><span><b>Vedicgen</b><small>{DIVISIONS.vedicgen.tagline}</small></span><I.Arrow width={16} height={16} /></Link>
            <Link to="/nayancode" className="ftr-div ftr-div--nc"><SubMark div="nayancode" size={26} /><span><b>Nayancode</b><small>{DIVISIONS.nayancode.tagline}</small></span><I.Arrow width={16} height={16} /></Link>
          </div>
        </div>
        <div className="ftr-top">
          <div className="ftr-col"><p className="label">Vivofold</p><Link to="/about">About the company</Link><Link to="/science">Our science</Link><Link to="/solutions">Solutions</Link><Link to="/industry">Industry landscape</Link><Link to="/research">Research</Link><Link to="/services">Research services</Link><Link to="/services#quote">Request a quote</Link><Link to="/learn">Knowledge hub</Link><Link to="/contact">Contact</Link></div>
          <div className="ftr-col"><p className="label">Vedicgen · Education</p><Link to="/vedicgen/courses">All courses</Link><Link to="/vedicgen/programs">Professional programmes</Link><Link to="/vedicgen/internships">Internships</Link><Link to="/vedicgen/workshops">Workshops</Link><Link to="/vedicgen/research-training">Research training</Link><Link to="/vedicgen/institutions">For institutions</Link><Link to="/vedicgen/pricing">Fees & pricing</Link><Link to="/vedicgen/apply">Apply</Link><Link to="/verify">Verify a certificate</Link></div>
          <div className="ftr-col"><p className="label">Nayancode · Software</p><Link to="/workbench">Open the Workbench</Link><Link to="/nayancode/products">All products</Link>{PRODUCTS.slice(1, 5).map((p) => <Link key={p.slug} to={`/nayancode/products/${p.slug}`}>{p.name.replace('Nayancode ', '')}</Link>)}<Link to="/nayancode/tools">Free online tools</Link><Link to="/nayancode/docs">Documentation</Link><Link to="/nayancode/pricing">Licensing</Link></div>
          <div className="ftr-col ftr-contact-col">
            <p className="label">Contact</p>
            <address>{lines.map((l, i) => <span key={i}>{l}</span>)}</address>
            <a href={mapUrl()} target="_blank" rel="noopener noreferrer" className="textlink small">View on Google Maps <I.External width={13} height={13} /></a>
            {otherLocations().map((o) => (
              <address key={o.label} className="ftr-office"><span className="office-label">{o.label} office</span>{o.lines.map((l, i) => <span key={i}>{l}</span>)}{o.line1 && <a href={o.map} target="_blank" rel="noopener noreferrer" className="textlink small">View on Google Maps <I.External width={13} height={13} /></a>}</address>
            ))}
            <dl className="ftr-mails">
              <div><dt>General</dt><dd><a href={`mailto:${BRAND.emails.general}`}>{BRAND.emails.general}</a></dd></div>
              <div><dt>Admissions & help</dt><dd><a href={`mailto:${BRAND.emails.help}`}>{BRAND.emails.help}</a></dd></div>
              <div><dt>Software support</dt><dd><a href={`mailto:${BRAND.emails.support}`}>{BRAND.emails.support}</a></dd></div>
              {BRAND.phone && <div><dt>Phone</dt><dd><a href={`tel:${BRAND.phone.replace(/[^\d+]/g, '')}`}>{BRAND.phone}</a></dd></div>}
            </dl>
          </div>
        </div>
        <div className="ftr-news-row"><div><p className="label">The Vivofold letter</p><p className="small">One practical guide a month, new cohorts and software releases. No spam.</p></div><Newsletter compact id="ftr-news" /></div>
        <div className="ftr-base">
          <span>© <span suppressHydrationWarning>{new Date().getFullYear()}</span> {BRAND.legalName || BRAND.name}. Vedicgen and Nayancode are divisions of {BRAND.name}. Research and education use; not for clinical decisions.</span>
          <nav className="ftr-legal" aria-label="Legal"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/refund-policy">Refunds & cancellations</Link><Link to="/licenses">Open-source licences</Link>{BRAND.socials.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>)}</nav>
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  );
}

/* ---------- layout ---------- */
export default function SiteLayout() {
  const loc = useLocation();
  const navType = useNavigationType();
  const first = useRef(true);
  const positions = useRef(new Map<string, number>());
  const [pending, setPending] = useState(false);
  const [navigated, setNavigated] = useState(false);
  const path = bare(loc.pathname);
  const div: DivisionId | undefined = path === '/vedicgen' || path.startsWith('/vedicgen/') ? 'vedicgen' : path === '/nayancode' || path.startsWith('/nayancode/') ? 'nayancode' : undefined;

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    // The head of the first page is prerendered. seo.ts (with the full course data it needs) is only required for later
    // in-app navigations, so warm it on the visitor's first interaction rather than on every page load.
    const warm = () => { void import('./seo'); off(); };
    const evs = ['pointerdown', 'keydown', 'touchstart', 'mouseover'] as const;
    const off = () => evs.forEach((e) => window.removeEventListener(e, warm));
    evs.forEach((e) => window.addEventListener(e, warm, { passive: true, once: true }));
    return off;
  }, []);
  useEffect(() => {
    const save = () => positions.current.set(loc.key, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [loc.key]);

  useIsoLayoutEffect(() => {
    setPending(false);
    if (first.current) { first.current = false; if (loc.hash) requestAnimationFrame(() => document.getElementById(decodeURIComponent(loc.hash.slice(1)))?.scrollIntoView({ block: 'start' })); return; }
    setNavigated(true);
    void import('./seo').then(({ metaFor, applyHead }) => { const m = metaFor(path); if (m) applyHead(m); });
    if (loc.hash) {
      const id = decodeURIComponent(loc.hash.slice(1));
      requestAnimationFrame(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); else window.scrollTo(0, 0); });
    } else if (navType === 'POP' && positions.current.has(loc.key)) window.scrollTo(0, positions.current.get(loc.key)!);
    else window.scrollTo(0, 0);
    if (navType !== 'POP') document.getElementById('main')?.focus({ preventScroll: true });
  }, [loc.key]);

  useEffect(() => {
    const linkOf = (t: EventTarget | null) => { const a = (t as Element | null)?.closest?.('a'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return null; const u = new URL(a.href, location.href); return u.origin === location.origin ? u : null; };
    const warm = (e: Event) => { const u = linkOf(e.target); if (u) prefetch(u.pathname); };
    const click = (e: MouseEvent) => { if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; const u = linkOf(e.target); if (u && bare(u.pathname) !== bare(location.pathname)) setPending(true); };
    // Pointer spotlight on interactive cards (CSS reads --mx/--my).
    const spot = (e: PointerEvent) => { const el = (e.target as Element | null)?.closest?.('.ccard, .pcard, .icard, .scard, .prcard, .dcard, .rcard, .sector') as HTMLElement | null; if (!el) return; const r = el.getBoundingClientRect(); el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`); };
    document.addEventListener('pointerover', warm, { passive: true }); document.addEventListener('focusin', warm); document.addEventListener('click', click); document.addEventListener('pointermove', spot, { passive: true });
    return () => { document.removeEventListener('pointerover', warm); document.removeEventListener('focusin', warm); document.removeEventListener('click', click); document.removeEventListener('pointermove', spot); };
  }, []);

  return (
    <div className="site" data-div={div}>
      <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); const m = document.getElementById('main'); m?.focus(); m?.scrollIntoView(); }}>Skip to content</a>
      <div className={`route-bar ${pending ? 'is-on' : ''}`} aria-hidden><i /></div>
      <TopBar />
      <Header />
      {div && <SubNav div={div} />}
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div style={{ minHeight: '70vh' }} />}>
          <div key={loc.pathname} className={navigated ? 'page-enter' : undefined}><Outlet /></div>
        </Suspense>
      </main>
      <Footer />
      {BRAND.whatsapp && <a className="wa" href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(`Hello ${BRAND.name}, I have a question about `)}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"><I.Whatsapp width={26} height={26} /></a>}
    </div>
  );
}
