// Route metadata and structured data. Used at build time (prerender writes it into each page's <head>) and in the
// browser (SiteLayout updates the head on client-side navigation), so both always agree. Every canonical URL ends
// with a slash, matching how GitHub Pages serves path/index.html.
import { BRAND, DIVISIONS, INTEGRATIONS, addressText } from '@/core/brand';
import { STUDIOS } from '@/core/studios';
import { ARTICLES, articleBySlug } from './data/articles';
import { COURSES, courseBySlug, durationOf, feeOf, FORMAT_LABEL, PROGRAMS, programBySlug, programParts, schoolOf, usdOf } from './data/courses';
import { HOME_FAQ } from './data/faq';
import { INTERN_PROCESS, INTERNSHIPS, internshipBySlug } from './data/internships';
import { PRODUCTS, productBySlug } from './data/products';
import { RESEARCH, researchBySlug } from './data/research';
import { SERVICES, serviceBySlug, statusOf } from './data/services';
import { TOOLS, toolBySlug } from './data/tools';
import { WORKSHOPS } from './data/training';

type Json = Record<string, unknown>;
export interface PageMeta { path: string; title: string; description: string; type: 'website' | 'article'; noindex?: boolean; jsonLd: Json[]; crumbs?: { name: string; path: string }[]; priority?: number; image?: string; brand?: 'vivofold' | 'vedicgen' | 'nayancode' }

const bare = (p: string) => p.replace(/\/+$/, '') || '/';
export const abs = (path: string) => BRAND.siteUrl + (bare(path) === '/' ? '/' : `${bare(path)}/`);
const ORG = `${BRAND.siteUrl}/#organization`;
const VG = `${BRAND.siteUrl}/vedicgen/#school`;
/** Course provider, written out in full (name and url) so consumers do not have to resolve an @id. The school belongs to Vivofold. */
const provider = (): Json => ({ '@type': 'Organization', '@id': ORG, name: BRAND.name, url: `${BRAND.siteUrl}/` });
const NC = `${BRAND.siteUrl}/nayancode/#software`;

const postalOf = (a: { line1: string; line2: string; city: string; region: string; postalCode: string; countryCode: string }) => ({ '@type': 'PostalAddress', ...(a.line1 ? { streetAddress: [a.line1, a.line2].filter(Boolean).join(', ') } : {}), addressLocality: a.city, addressRegion: a.region, ...(a.postalCode ? { postalCode: a.postalCode } : {}), addressCountry: a.countryCode });
const postal = () => ({ '@type': 'PostalAddress', streetAddress: `${BRAND.address.line1}, ${BRAND.address.line2}`, addressLocality: BRAND.address.city, addressRegion: BRAND.address.region, postalCode: BRAND.address.postalCode, addressCountry: BRAND.address.countryCode });
const contacts = () => [
  { '@type': 'ContactPoint', contactType: 'customer service', email: BRAND.emails.general, areaServed: ['IN', 'Worldwide'], availableLanguage: ['English'] },
  { '@type': 'ContactPoint', contactType: 'admissions', email: BRAND.emails.help, areaServed: ['IN', 'Worldwide'], availableLanguage: ['English'] },
  { '@type': 'ContactPoint', contactType: 'technical support', email: BRAND.emails.support, areaServed: 'Worldwide', availableLanguage: ['English'] },
];
export function organization(): Json {
  return {
    '@type': ['Organization', 'LocalBusiness'], '@id': ORG, name: BRAND.name, ...(BRAND.legalName ? { legalName: BRAND.legalName } : {}), url: abs('/'),
    logo: { '@type': 'ImageObject', url: abs('/brand/vivofold-logo-512.png').replace(/\/$/, ''), width: 512, height: 512 }, image: `${BRAND.siteUrl}/og.png`,
    description: BRAND.description, slogan: BRAND.tagline, email: BRAND.emails.general, address: BRAND.locations.length ? [postal(), ...BRAND.locations.map(postalOf)] : postal(), contactPoint: contacts(),
    ...(BRAND.phone ? { telephone: BRAND.phone } : {}), ...(BRAND.foundingYear ? { foundingDate: BRAND.foundingYear } : {}), ...(BRAND.socials.length ? { sameAs: BRAND.socials.map((s) => s.url) } : {}),
    areaServed: ['India', 'Worldwide'], priceRange: '₹₹',
    department: [{ '@id': VG }, { '@id': NC }],
    knowsAbout: ['AI drug discovery', 'Generative AI for chemistry', 'Physics-based drug design', 'Free-energy calculations', 'Multi-omics integration', 'Spatial biology', 'Target discovery', 'Clinical variant interpretation', 'Pharmacogenomics', 'Biotechnology', 'Bioinformatics', 'Computational biology', 'Genomics', 'Transcriptomics', 'RNA-seq', 'Next-generation sequencing', 'Molecular biology', 'Cell culture', 'Microbiology', 'Molecular docking', 'Cheminformatics', 'QSAR', 'Machine learning in biology', 'Scientific software', 'Cloud computing for genomics', 'Geoinformatics', 'Health informatics'],
  };
}
const vedicgen = (): Json => ({ '@type': 'EducationalOrganization', '@id': VG, name: `${BRAND.name} ${DIVISIONS.vedicgen.name}`, alternateName: DIVISIONS.vedicgen.name, url: abs('/vedicgen'), description: DIVISIONS.vedicgen.line, slogan: DIVISIONS.vedicgen.tagline, parentOrganization: { '@id': ORG }, email: BRAND.emails.help, address: postal() });
const nayancode = (): Json => ({ '@type': 'Organization', '@id': NC, name: `${BRAND.name} ${DIVISIONS.nayancode.name}`, alternateName: DIVISIONS.nayancode.name, url: abs('/nayancode'), description: DIVISIONS.nayancode.line, slogan: DIVISIONS.nayancode.tagline, parentOrganization: { '@id': ORG }, email: BRAND.emails.support });
const faqLd = (items: { q: string; a: string }[]): Json => ({ '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const crumbLd = (c: { name: string; path: string }[]): Json => ({ '@type': 'BreadcrumbList', itemListElement: c.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: abs(x.path) })) });
const list = (items: { name: string; path: string }[]): Json => ({ '@type': 'ItemList', itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(x.path), name: x.name })) });

const H = { name: 'Home', path: '/' };
const VGc = { name: 'Vedicgen', path: '/vedicgen' };
const NCc = { name: 'Nayancode', path: '/nayancode' };

type Static = Omit<PageMeta, 'path' | 'jsonLd'> & { jsonLd?: () => Json[]; parent?: { name: string; path: string }; name?: string };
const STATIC: Record<string, Static> = {
  '/': { title: `${BRAND.name}: Bioinformatics Courses, Software & Research Services`, description: `${BRAND.name} is a computational biotech company in India: AI drug discovery and bioinformatics services, Vedicgen courses and internships, free Nayancode software.`, type: 'website', priority: 1, jsonLd: () => [{ '@type': 'WebSite', '@id': `${BRAND.siteUrl}/#website`, name: BRAND.name, alternateName: ['Vivofold.in', `${BRAND.name} ${DIVISIONS.vedicgen.name}`], url: abs('/'), publisher: { '@id': ORG }, inLanguage: 'en-IN' }, vedicgen(), nayancode(), faqLd(HOME_FAQ)] },
  '/about': { name: 'About', title: `About ${BRAND.name}: Computational Biotechnology Company`, description: `${BRAND.name} is a computational biotechnology company in India. Our approach, how Vedicgen and Nayancode fit in, our mission and our offices.`, type: 'website', priority: 0.7, jsonLd: () => [vedicgen(), nayancode()] },
  '/contact': { name: 'Contact', title: `Contact ${BRAND.name}: Courses, Software & Research Services`, description: `Contact ${BRAND.name}: ${BRAND.emails.general} for general enquiries, ${BRAND.emails.help} for admissions and ${BRAND.emails.support} for software support.`, type: 'website', priority: 0.7 },
  '/science': { name: 'Our science', title: 'Our Science: Generative AI, Physics-Based Drug Discovery', description: 'Vivofold focus areas: generative AI and physics-based drug discovery, de novo design, multi-omics and spatial biology, target discovery and novel biologics.', type: 'website', priority: 0.9 },
  '/solutions': { name: 'Solutions', title: 'Solutions for Biopharma: Contract AI Discovery, CADD, NGS', description: 'Contract AI drug discovery, CADD and QSAR, NGS pipelines, clinical variant interpretation, pharmacogenomics, biomarker strategy and bio-IT for biopharma.', type: 'website', priority: 0.9 },
  '/industry': { name: 'Industry landscape', title: 'AI Drug Discovery Industry Landscape 2026: Deals & Trends', description: 'Where AI drug discovery and bioinformatics are heading in 2026: partnerships, physics-plus-AI models, spatial foundation models and agentic AI.', type: 'website', priority: 0.7 },
  '/research': { name: 'Research', title: 'Research: Genomics, Drug Discovery, AI & Scientific Software', description: 'Vivofold research areas: genomics, computational drug discovery, AI for biology, microbial genomics, health data science and validated scientific software.', type: 'website', priority: 0.75, jsonLd: () => [list(RESEARCH.map((r) => ({ name: r.title, path: `/research/${r.slug}` })))] },
  '/services': { name: 'Services', title: 'Bioinformatics & Bio-IT Services: NGS, RNA-seq, Docking, Cloud', description: 'Research services from Vivofold: RNA-seq, WGS/WES, single-cell, multi-omics, docking, QSAR, pipelines, cloud and custom scientific software.', type: 'website', priority: 0.9, jsonLd: () => [list(SERVICES.map((s) => ({ name: s.title, path: `/services/${s.slug}` })))] },
  '/learn': { name: 'Knowledge hub', title: 'Bioinformatics & Biotechnology Tutorials and Guides', description: 'Practical guides on RNA-seq, NGS, VCF and FASTQ formats, docking validation, QSAR, qPCR analysis, wet-lab techniques and careers in bioinformatics.', type: 'website', priority: 0.8, jsonLd: () => [list(ARTICLES.map((a) => ({ name: a.title, path: `/learn/${a.slug}` })))] },
  '/verify': { name: 'Verify a certificate', title: 'Verify a Vedicgen Certificate', description: `Check that a Vedicgen certificate issued by ${BRAND.name} is genuine by entering its unique certificate ID.`, type: 'website', priority: 0.3 },
  '/privacy': { name: 'Privacy policy', title: 'Privacy Policy', description: `How ${BRAND.name} collects, uses and protects personal data submitted through this website, under India’s Digital Personal Data Protection Act, 2023.`, type: 'website', priority: 0.2 },
  '/terms': { name: 'Terms of use', title: 'Terms of Use', description: `Terms that govern the use of the ${BRAND.name} website, Vedicgen programmes and Nayancode software.`, type: 'website', priority: 0.2 },
  '/refund-policy': { name: 'Refunds & cancellations', title: 'Refund & Cancellation Policy', description: `Refund, cancellation and transfer policy for Vedicgen courses, programmes, internships and workshops offered by ${BRAND.name}.`, type: 'website', priority: 0.2 },

  '/vedicgen': { name: 'Vedicgen', brand: 'vedicgen', title: 'Vivofold Vedicgen: Bioinformatics & Biotech Courses, India', description: `Vivofold Vedicgen: ${COURSES.length} bioinformatics and biotechnology courses, ${PROGRAMS.length} certificate programmes, ${INTERNSHIPS.length} internship tracks and workshops, online and in person.`, type: 'website', priority: 0.98, jsonLd: () => [vedicgen()] },
  '/vedicgen/courses': { name: 'Courses', parent: VGc, brand: 'vedicgen', title: 'Bioinformatics & Biotech Courses in India | Vivofold Vedicgen', description: `${COURSES.length} bioinformatics, biotechnology and computing courses, online or in person, up to 4 weeks, with syllabus, fees and a verifiable certificate.`, type: 'website', priority: 0.97, jsonLd: () => [list(COURSES.map((c) => ({ name: c.title, path: `/vedicgen/courses/${c.slug}` })))] },
  '/vedicgen/programs': { name: 'Programmes', parent: VGc, brand: 'vedicgen', title: 'Bioinformatics Certificate Programmes | Vivofold Vedicgen', description: 'Professional certificate programmes in genomics data science, computational drug discovery, wet-lab biotechnology, Bio-IT and AI for life sciences.', type: 'website', priority: 0.9, jsonLd: () => [list(PROGRAMS.map((p) => ({ name: p.title, path: `/vedicgen/programs/${p.slug}` })))] },
  '/vedicgen/internships': { name: 'Internships', parent: VGc, brand: 'vedicgen', title: 'Bioinformatics Internships for Students | Vivofold Vedicgen', description: `${INTERNSHIPS.length} mentored internship tracks in bioinformatics, drug discovery, AI and wet-lab biotechnology, plus dissertations. Fee-based; selection process and certificate.`, type: 'website', priority: 0.95, jsonLd: () => [list(INTERNSHIPS.map((x) => ({ name: x.title, path: `/vedicgen/internships/${x.slug}` }))), { '@type': 'HowTo', name: 'How to apply for a Vedicgen internship', step: INTERN_PROCESS.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.t, text: s.d })) }] },
  '/vedicgen/workshops': { name: 'Workshops', parent: VGc, brand: 'vedicgen', title: 'Bioinformatics & Biotech Workshops | Vivofold Vedicgen', description: `Short hands-on workshops from ₹999, online and in person: molecular docking, RNA-seq with Galaxy, Python, AlphaFold, single-cell, PCR and ELISA.`, type: 'website', priority: 0.85, jsonLd: () => [list(WORKSHOPS.map((w) => ({ name: w.title, path: `/vedicgen/workshops#${w.slug}` })))] },
  '/vedicgen/research-training': { name: 'Research training', parent: VGc, brand: 'vedicgen', title: 'Research Training & Mentoring for Students and Researchers', description: 'Research skills bootcamp, mentored research projects, one-to-one research mentoring and thesis data-analysis clinics in bioinformatics and biotechnology.', type: 'website', priority: 0.8 },
  '/vedicgen/institutions': { name: 'For institutions', parent: VGc, brand: 'vedicgen', title: 'Bioinformatics Training for Colleges, Universities & Industry', description: 'Campus workshops, faculty development programmes, value-added certificate courses and corporate upskilling in bioinformatics from Vivofold Vedicgen.', type: 'website', priority: 0.85 },
  '/vedicgen/pricing': { name: 'Fees & pricing', parent: VGc, brand: 'vedicgen', title: 'Vedicgen Fees: Courses, Internships & Workshops (INR)', description: 'Vedicgen fees in INR: self-paced and live online courses, wet-lab bench courses, programmes, internships, workshops and institutional rates.', type: 'website', priority: 0.85 },
  '/vedicgen/apply': { name: 'Apply', parent: VGc, brand: 'vedicgen', title: 'Apply to Vedicgen: Courses, Programmes & Internships', description: 'Apply online to a Vedicgen course, programme, internship or research training. Admission process, eligibility, selection criteria and what happens next.', type: 'website', priority: 0.9 },

  '/nayancode': { name: 'Nayancode', brand: 'nayancode', title: 'Vivofold Nayancode: Free Bioinformatics Software Online', description: 'Vivofold Nayancode: free, open-source bioinformatics software in your browser for genomics, RNA-seq, single-cell, docking and structures. No install, no upload.', type: 'website', priority: 0.95, jsonLd: () => [nayancode()] },
  '/nayancode/products': { name: 'Products', parent: NCc, brand: 'nayancode', title: 'Nayancode Products: Bioinformatics Studios & Tools', description: `All ${PRODUCTS.length} Nayancode products: the Workbench suite, sequence, genome, variant, expression, single-cell, microbiome, chemistry, structure and phylogenetics studios.`, type: 'website', priority: 0.9, jsonLd: () => [list(PRODUCTS.map((p) => ({ name: p.name, path: `/nayancode/products/${p.slug}` })))] },
  '/nayancode/tools': { name: 'Free tools', parent: NCc, brand: 'nayancode', title: 'Free Online Bioinformatics Tools (Private, In-Browser)', description: 'Free bioinformatics tools in your browser: GC content, reverse complement, ORF finder, alignment, restriction sites, FASTA validator and primer Tm.', type: 'website', priority: 0.85, jsonLd: () => [list(TOOLS.map((t) => ({ name: t.name, path: `/nayancode/tools/${t.slug}` })))] },
  '/nayancode/docs': { name: 'Documentation', parent: NCc, brand: 'nayancode', title: 'Nayancode Documentation: Getting Started, Formats & Limits', description: 'Nayancode documentation: getting started, supported file formats, privacy model, system requirements, per-product reference, limits and citation.', type: 'website', priority: 0.7 },
  '/nayancode/pricing': { name: 'Licensing', parent: NCc, brand: 'nayancode', title: 'Nayancode Licensing: Free Preview, Academic & Enterprise', description: 'Nayancode is free during the public preview. Academic teaching use is free; institutional, self-hosted and enterprise licences are quoted on request.', type: 'website', priority: 0.7 },
  '/nayancode/demo': { name: 'Request a demo', parent: NCc, brand: 'nayancode', title: 'Request a Nayancode Demo or Product Consultation', description: 'Book a demo of Nayancode scientific software, ask about classroom use, self-hosted deployments, custom studios or support.', type: 'website', priority: 0.6 },
};

function courseLd(slug: string, path: string): Json[] {
  const c = courseBySlug(slug)!;
  const offers = c.formats.map((f) => ({ '@type': 'Offer', category: 'Paid', price: String(feeOf(c, f)), priceCurrency: 'INR', url: abs(path), availability: 'https://schema.org/InStock', name: FORMAT_LABEL[f], description: 'Price excludes 18% GST.' }));
  const usd = c.formats.map((f) => usdOf(c, f)).filter((x): x is number => !!x);
  const instances = c.formats.map((f) => ({ '@type': 'CourseInstance', courseMode: f === 'in-person' ? 'Onsite' : f === 'live' ? 'Online' : 'Online', courseWorkload: f === 'self-paced' ? `PT${c.hours}H` : `PT${c.hours}H`, ...(f === 'in-person' ? { location: { '@type': 'Place', name: `${BRAND.name} laboratory`, address: postal() } } : {}), ...(f === 'self-paced' ? {} : { courseSchedule: { '@type': 'Schedule', repeatFrequency: f === 'in-person' ? 'Daily' : 'Weekly', repeatCount: f === 'in-person' ? c.days ?? 5 : c.weeks ?? 6 } }), name: `${c.title} (${FORMAT_LABEL[f]})`, description: durationOf(c, f) }));
  return [{
    '@type': 'Course', '@id': `${abs(path)}#course`, name: c.title, description: c.seoDescription, url: abs(path), provider: provider(), educationalLevel: c.level, inLanguage: 'en-IN', timeRequired: `PT${c.hours}H`,
    teaches: c.outcomes, coursePrerequisites: c.prerequisites, about: c.skills, keywords: c.keywords.join(', '), isAccessibleForFree: false,
    educationalCredentialAwarded: 'Vedicgen certificate of completion with verification ID', hasCourseInstance: instances, offers: usd.length ? [...offers, ...c.formats.map((f) => usdOf(c, f)).filter(Boolean).map((p) => ({ '@type': 'Offer', category: 'Paid', price: String(p), priceCurrency: 'USD', url: abs(path), availability: 'https://schema.org/InStock' }))] : offers,
    syllabusSections: c.modules.map((m) => ({ '@type': 'Syllabus', name: m.title, description: m.topics.join('; ') })),
    audience: { '@type': 'EducationalAudience', educationalRole: 'student', audienceType: c.forWho.join('; ') },
  }];
}

export function metaFor(path: string): PageMeta | null {
  const p = bare(path);
  const s = STATIC[p];
  if (s) {
    const crumbs = p === '/' ? undefined : [H, ...(s.parent ? [s.parent] : []), { name: s.name ?? s.title, path: p }];
    const jsonLd: Json[] = [organization(), ...(s.jsonLd ? s.jsonLd() : [])];
    if (crumbs) jsonLd.push(crumbLd(crumbs));
    return { path: p, title: s.title, description: s.description, type: s.type, priority: s.priority, brand: s.brand ?? 'vivofold', crumbs, jsonLd, noindex: s.noindex };
  }
  const parts = p.split('/').filter(Boolean);
  const [a, b, c] = parts;
  if (a === 'vedicgen' && b === 'courses' && c) {
    const x = courseBySlug(c); if (!x) return null;
    const crumbs = [H, VGc, { name: 'Courses', path: '/vedicgen/courses' }, { name: x.title, path: p }];
    return { path: p, title: x.seoTitle, description: x.seoDescription, type: 'website', brand: 'vedicgen', crumbs, priority: 0.9, jsonLd: [organization(), vedicgen(), ...courseLd(c, p), faqLd(x.faq), crumbLd(crumbs)] };
  }
  if (a === 'vedicgen' && b === 'programs' && c) {
    const x = programBySlug(c); if (!x) return null;
    const crumbs = [H, VGc, { name: 'Programmes', path: '/vedicgen/programs' }, { name: x.title, path: p }];
    return { path: p, title: x.title.length > 58 ? x.title.replace('Professional Certificate in ', 'Certificate: ').replace('Advanced Certificate in ', 'Certificate: ') : x.title, description: clip(`${x.title}: ${x.steps.length} courses over about ${x.months} months at your own pace, ₹${x.fee.toLocaleString('en-IN')} + GST, with a verifiable certificate. ${x.who}`), type: 'website', brand: 'vedicgen', crumbs, priority: 0.88, jsonLd: [organization(), vedicgen(), { '@type': 'EducationalOccupationalProgram', name: x.title, description: x.outcome, url: abs(p), provider: provider(), timeToComplete: `P${x.months}M`, educationalProgramMode: x.format, offers: { '@type': 'Offer', price: String(x.fee), priceCurrency: 'INR', category: 'Paid' }, hasCourse: programParts(x).map((pc) => ({ '@type': 'Course', name: pc.title, url: abs(`/vedicgen/courses/${pc.slug}`), provider: provider(), description: pc.short })) }, crumbLd(crumbs)] };
  }
  if (a === 'vedicgen' && b === 'internships' && c) {
    const x = internshipBySlug(c); if (!x) return null;
    const crumbs = [H, VGc, { name: 'Internships', path: '/vedicgen/internships' }, { name: x.title, path: p }];
    return { path: p, title: x.seoTitle.replace(' | Vedicgen', '').replace(' | Nayancode', ''), description: x.seoDescription, type: 'website', brand: 'vedicgen', crumbs, priority: 0.88, jsonLd: [organization(), vedicgen(), { '@type': 'EducationalOccupationalProgram', name: x.title, description: x.intro, url: abs(p), provider: provider(), educationalProgramMode: x.mode, programType: 'Internship', offers: x.options.map((o) => ({ '@type': 'Offer', name: o.label, price: String(o.fee), priceCurrency: 'INR', category: o.fee ? 'Paid' : 'Free' })), occupationalCredentialAwarded: 'Vedicgen internship certificate with verification ID' }, faqLd(x.faq), crumbLd(crumbs)] };
  }
  if (a === 'nayancode' && b === 'products' && c) {
    const x = productBySlug(c); if (!x) return null;
    const crumbs = [H, NCc, { name: 'Products', path: '/nayancode/products' }, { name: x.name.replace('Nayancode ', ''), path: p }];
    return { path: p, title: x.seoTitle, description: x.seoDescription, type: 'website', brand: 'nayancode', crumbs, priority: 0.85, image: x.shot, jsonLd: [organization(), nayancode(), { '@type': 'SoftwareApplication', name: x.name, applicationCategory: 'ScientificApplication', applicationSubCategory: x.line, operatingSystem: 'Any (web browser)', description: x.seoDescription, url: abs(p), screenshot: `${BRAND.siteUrl}${x.shot}`, featureList: x.features.map((f) => f.t), isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, publisher: { '@id': NC } }, crumbLd(crumbs)] };
  }
  if (a === 'nayancode' && b === 'tools' && c) {
    const t = toolBySlug(c); if (!t) return null;
    const crumbs = [H, NCc, { name: 'Free tools', path: '/nayancode/tools' }, { name: t.name, path: p }];
    return { path: p, title: t.seoTitle, description: t.seoDescription, type: 'website', brand: 'nayancode', crumbs, priority: 0.8, jsonLd: [organization(), { '@type': 'SoftwareApplication', name: t.name, applicationCategory: 'ScientificApplication', operatingSystem: 'Any (web browser)', description: t.seoDescription, url: abs(p), isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, publisher: { '@id': NC } }, faqLd(t.faq), crumbLd(crumbs)] };
  }
  if (a === 'services' && b) {
    const sv = serviceBySlug(b); if (!sv) return null;
    const crumbs = [H, { name: 'Services', path: '/services' }, { name: sv.title, path: p }];
    const planned = statusOf(sv) === 'planned';
    return { path: p, title: sv.seoTitle, description: sv.seoDescription, type: 'website', crumbs, priority: planned ? 0.5 : 0.85, jsonLd: [organization(), { '@type': 'Service', name: sv.title, serviceType: sv.title, category: sv.category, description: sv.seoDescription, provider: { '@id': ORG }, areaServed: ['India', 'Worldwide'], url: abs(p), ...(planned ? {} : { availableChannel: { '@type': 'ServiceChannel', serviceUrl: abs(p), serviceLocation: { '@type': 'Place', address: postal() } } }) }, faqLd(sv.faq), crumbLd(crumbs)] };
  }
  if (a === 'research' && b) {
    const r = researchBySlug(b); if (!r) return null;
    const crumbs = [H, { name: 'Research', path: '/research' }, { name: r.title, path: p }];
    return { path: p, title: r.seoTitle, description: r.seoDescription, type: 'website', crumbs, priority: 0.65, jsonLd: [organization(), { '@type': 'ResearchProject', name: r.title, description: r.intro, url: abs(p), sponsor: { '@id': ORG }, keywords: r.keywords.join(', ') }, crumbLd(crumbs)] };
  }
  if (a === 'learn' && b) {
    const x = articleBySlug(b); if (!x) return null;
    const crumbs = [H, { name: 'Knowledge hub', path: '/learn' }, { name: x.title, path: p }];
    return { path: p, title: x.seoTitle, description: x.description, type: 'article', crumbs, priority: 0.8, jsonLd: [organization(), { '@type': 'TechArticle', headline: x.title, description: x.description, image: `${BRAND.siteUrl}/og.png`, datePublished: x.published, dateModified: x.updated ?? x.published, author: x.author ? { '@type': 'Person', name: x.author } : { '@id': ORG }, publisher: { '@id': ORG }, mainEntityOfPage: abs(p), articleSection: x.category, keywords: x.keywords.join(', '), inLanguage: 'en' }, crumbLd(crumbs)] };
  }
  const studio = STUDIOS.find((x) => x.path === p);
  if (studio) return { path: p, title: `${studio.name}: Free Online ${studio.short} Analysis | Nayancode`.length > 65 ? `${studio.name}: Free Online Analysis | Nayancode` : `${studio.name}: Free Online ${studio.short} Analysis | Nayancode`, description: `${studio.blurb} Part of the Nayancode Workbench by ${BRAND.name}. Runs entirely in your browser; your files are never uploaded.`, type: 'website', brand: 'nayancode', jsonLd: [organization()] };
  const tool: Record<string, string> = { '/workbench': 'Nayancode Workbench', '/licenses': 'Open-source licences', '/report': 'Report builder', '/atlas': 'Gene Atlas', '/import': 'Import nf-core results' };
  if (tool[p]) return { path: p, title: tool[p], description: `${tool[p]}: part of the Nayancode Workbench by ${BRAND.name}. Free bioinformatics in your browser, and your files are never uploaded.`, type: 'website', brand: 'nayancode', jsonLd: [organization()], noindex: p !== '/workbench' };
  return null;
}

/** Page title with the brand suffix, dropped when it would push the title past what search results display (~60 characters). */
export const fullTitle = (m: PageMeta) => (m.path === '/' || m.title.includes(BRAND.name) || m.title.length + BRAND.name.length + 3 > 64 ? m.title : `${m.title} | ${BRAND.name}`);

/** Indexable public routes, for prerendering and the sitemap. */
export function siteRoutes(): string[] {
  return [
    ...Object.keys(STATIC),
    ...COURSES.map((c) => `/vedicgen/courses/${c.slug}`),
    ...PROGRAMS.map((x) => `/vedicgen/programs/${x.slug}`),
    ...INTERNSHIPS.map((x) => `/vedicgen/internships/${x.slug}`),
    ...PRODUCTS.map((x) => `/nayancode/products/${x.slug}`),
    ...TOOLS.map((t) => `/nayancode/tools/${t.slug}`),
    ...SERVICES.map((x) => `/services/${x.slug}`),
    ...RESEARCH.map((x) => `/research/${x.slug}`),
    ...ARTICLES.map((x) => `/learn/${x.slug}`),
  ];
}
/** Workbench routes: client-rendered, but given their own HTML file so deep links and titles work. */
export const appRoutes = () => ['/workbench', '/licenses', '/report', '/atlas', '/import', ...STUDIOS.map((s) => s.path)];
/** Old URLs (from earlier versions of the site) → new URLs. Prerender writes a redirect page for each. */
export function legacyRedirects(): [string, string][] {
  return [
    ['/courses', '/vedicgen/courses'], ...COURSES.map((c) => [`/courses/${c.slug}`, `/vedicgen/courses/${c.slug}`] as [string, string]),
    ['/internships', '/vedicgen/internships'], ['/tools', '/nayancode/tools'], ...TOOLS.map((t) => [`/tools/${t.slug}`, `/nayancode/tools/${t.slug}`] as [string, string]),
    ['/platform', '/nayancode/products/workbench'], ['/services/institutional-training-workshops', '/vedicgen/institutions'], ['/pricing', '/vedicgen/pricing'], ['/apply', '/vedicgen/apply'],
  ];
}

const OG: Record<NonNullable<PageMeta['brand']>, string> = { vivofold: '/og.png', vedicgen: '/og-vedicgen.png', nayancode: '/og-nayancode.png' };
/** Search engines show about 155–160 characters of a description: end at a sentence (or word) boundary within that. */
export function clip(d: string, max = 160): string {
  if (d.length <= max) return d;
  const cut = d.slice(0, max), stop = cut.lastIndexOf('. ');
  if (stop >= 90) return cut.slice(0, stop + 1);
  return `${cut.slice(0, cut.lastIndexOf(' ', max - 1)).replace(/[,;:\s]+$/, '')}…`;
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** The <head> tags for a page, as an HTML string (build time). */
export function headHtml(m: PageMeta): string {
  const url = abs(m.path), img = `${BRAND.siteUrl}${OG[m.brand ?? 'vivofold']}`, t = fullTitle(m);
  const tags = [
    `<title>${esc(t)}</title>`,
    `<meta name="description" content="${esc(clip(m.description))}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...(m.noindex ? [] : [`<link rel="alternate" hreflang="en-IN" href="${url}" />`, `<link rel="alternate" hreflang="x-default" href="${url}" />`]),
    m.noindex ? '<meta name="robots" content="noindex" />' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />',
    `<meta property="og:type" content="${m.type}" />`, `<meta property="og:site_name" content="${esc(BRAND.name)}" />`,
    `<meta property="og:title" content="${esc(t)}" />`, `<meta property="og:description" content="${esc(clip(m.description))}" />`,
    `<meta property="og:url" content="${url}" />`, `<meta property="og:image" content="${img}" />`, `<meta property="og:image:alt" content="${esc(`${BRAND.name}: ${BRAND.tagline}`)}" />`,
    '<meta property="og:image:width" content="1200" />', '<meta property="og:image:height" content="630" />', '<meta property="og:locale" content="en_IN" />',
    '<meta name="twitter:card" content="summary_large_image" />', `<meta name="twitter:title" content="${esc(t)}" />`,
    `<meta name="twitter:description" content="${esc(clip(m.description))}" />`, `<meta name="twitter:image" content="${img}" />`,
    `<meta name="geo.region" content="IN-KA" />`, `<meta name="geo.placename" content="${esc(BRAND.address.city)}" />`,
    INTEGRATIONS.googleSiteVerification && `<meta name="google-site-verification" content="${esc(INTEGRATIONS.googleSiteVerification)}" />`,
    INTEGRATIONS.bingSiteVerification && `<meta name="msvalidate.01" content="${esc(INTEGRATIONS.bingSiteVerification)}" />`,
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': m.jsonLd }).replace(/</g, '\\u003c')}</script>`,
  ];
  return tags.filter(Boolean).join('\n    ');
}
export { addressText, schoolOf };

/** Client-side: keep the head in sync after in-app navigation. */
export function applyHead(m: PageMeta) {
  document.title = fullTitle(m);
  const set = (sel: string, attr: string, val: string, make: () => HTMLElement) => { let el = document.head.querySelector(sel) as HTMLElement | null; if (!el) { el = make(); document.head.appendChild(el); } el.setAttribute(attr, val); };
  const meta = (k: string, v: string, prop = false) => set(`meta[${prop ? 'property' : 'name'}="${k}"]`, 'content', v, () => { const e = document.createElement('meta'); e.setAttribute(prop ? 'property' : 'name', k); return e; });
  meta('description', clip(m.description)); meta('og:title', fullTitle(m), true); meta('og:description', clip(m.description), true); meta('og:url', abs(m.path), true); meta('og:type', m.type, true);
  meta('twitter:title', fullTitle(m)); meta('twitter:description', clip(m.description));
  meta('robots', m.noindex ? 'noindex' : 'index, follow, max-image-preview:large, max-snippet:-1');
  set('link[rel="canonical"]', 'href', abs(m.path), () => { const e = document.createElement('link'); e.setAttribute('rel', 'canonical'); return e; });
  let ld = document.head.querySelector('script[type="application/ld+json"]');
  if (!ld) { ld = document.createElement('script'); ld.setAttribute('type', 'application/ld+json'); document.head.appendChild(ld); }
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': m.jsonLd });
}
