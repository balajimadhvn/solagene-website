// ============================================================================================================
// COMPANY IDENTITY: the one file to edit for company details.
// The whole site, the prerendered HTML, sitemap.xml, robots.txt, structured data and the share images read from
// here. Optional values left empty ('' or []) are hidden on the site rather than shown as placeholders.
// `npm run build` prints a launch checklist of everything still unset.
//
// The logo is a component (src/site/brand.tsx → SolageneMark, files in public/brand/). To change it, replace
// public/brand/solagene-mark.svg/.webp and src/site/wordmark.ts, then run `npm run og` to regenerate icons and share images.
// ============================================================================================================

export interface TeamMember { name: string; role: string; bio: string; photo?: string; credentials?: string[]; links?: { label: string; url: string }[] }

export const BRAND = {
  name: 'Solagene',
  short: 'Solagene',
  legalName: '', // registered company name, e.g. 'Solagene Private Limited'; shown in the footer and structured data when set
  tagline: 'Research, education, innovation.',
  slogan: 'Computational discovery of drug targets and medicines.',
  description: 'Solagene is a computational biotechnology company. We combine generative AI, physics-based simulation and multi-omics biology to discover first-in-class targets and design small molecules, proteins and novel biologics with biopharma and research partners. Vedicgen (education) and Nayancode (scientific software) are part of Solagene.',
  version: '1.0.0',
  /** Route of the Workbench overview on this website (the standalone Nayancode build uses '/'). */
  workbenchHome: '/workbench',
  siteUrl: 'https://solagene.com', // production origin without a trailing slash (canonical URLs, sitemap, share links)
  email: 'contact@solagene.com', // general enquiries; forms fall back to the right inbox below
  emails: {
    general: 'contact@solagene.com', // company, partnerships, research services, press
    help: 'help@solagene.com', // admissions, courses, internships, applications
    support: 'support@solagene.com', // Nayancode software, technical support, accounts
  },
  phone: '', // official phone, e.g. '+91 80 1234 5678'; shown on Contact and in the footer when set
  whatsapp: '', // digits only with country code, e.g. '918012345678'; enables the WhatsApp button
  address: {
    line1: '2nd Floor, No. 754, 19th Main Rd, 22nd Cross Rd',
    line2: 'Sector 2, HSR Layout',
    city: 'Bengaluru',
    region: 'Karnataka',
    postalCode: '560102',
    country: 'India',
    countryCode: 'IN',
  },
  /** Further offices, shown after the main address (footer, Contact page, structured data). Leave a line empty until known. */
  locations: [
    { label: 'Chennai', line1: '', line2: '', city: 'Chennai', region: 'Tamil Nadu', postalCode: '', country: 'India', countryCode: 'IN' },
  ] as { label: string; line1: string; line2: string; city: string; region: string; postalCode: string; country: string; countryCode: string }[],
  hours: 'Monday to Saturday, 10:00 to 18:00 IST', // business hours shown on Contact; '' hides it
  foundingYear: '', // e.g. '2026'
  socials: [] as { label: string; url: string }[], // e.g. [{ label: 'LinkedIn', url: 'https://www.linkedin.com/company/solagene' }]
};

/** The two divisions. Names, lines and colours are used by the logo lockups, page headers, metadata and share images. */
export const DIVISIONS = {
  vedicgen: {
    name: 'Vedicgen',
    role: 'Education division of Solagene',
    tagline: 'From pipette to pipeline.',
    line: 'Hands-on training in biotechnology, bioinformatics and the life sciences: wet-lab and dry-lab courses, internships, workshops and research training.',
    path: '/vedicgen',
    email: 'help@solagene.com',
  },
  nayancode: {
    name: 'Nayancode',
    role: 'Software division of Solagene',
    tagline: 'See the biology in your data.',
    line: 'Scientific software for genomics, transcriptomics, structural biology and cheminformatics, built to run privately in your browser.',
    path: '/nayancode',
    email: 'support@solagene.com',
  },
} as const;
export type DivisionId = keyof typeof DIVISIONS;

/** Free, zero-maintenance integrations. All optional: when empty, the site falls back gracefully. */
export const INTEGRATIONS = {
  // Form backend for applications, enquiries and demo requests. Works on GitHub Pages without a server:
  //  • Formspree (https://formspree.io): create a form and set formEndpoint to 'https://formspree.io/f/<your-form-id>'.
  //  • Web3Forms (https://web3forms.com): set formEndpoint to 'https://api.web3forms.com/submit' and formAccessKey.
  // The endpoint can also be supplied at build time with the VITE_FORM_ENDPOINT / VITE_FORM_ACCESS_KEY environment
  // variables (for example as GitHub Actions repository variables). When empty, forms open the visitor's mail app
  // with the application already written, addressed to the right Solagene inbox.
  //  • Default (no setup, no account): FormSubmit (https://formsubmit.co) delivers each form to its Solagene inbox
  //    (contact@, help@ or support@). The FIRST message to each address triggers a one-time "Activate Form" e-mail
  //    to that inbox; click it once per inbox. Set VITE_FORM_PROVIDER=mailto to switch this off.
  formEndpoint: (import.meta.env?.VITE_FORM_ENDPOINT as string | undefined) ?? '',
  formProvider: ((import.meta.env?.VITE_FORM_PROVIDER as string | undefined) ?? 'formsubmit') as 'formsubmit' | 'mailto',
  formAccessKey: (import.meta.env?.VITE_FORM_ACCESS_KEY as string | undefined) ?? '',
  // Newsletter: a Buttondown/ConvertKit-style POST endpoint. When empty, sign-ups go through the form backend.
  newsletterEndpoint: '',
  // Google Search Console HTML-tag verification token (the content="…" value) and Bing Webmaster Tools token.
  googleSiteVerification: (import.meta.env?.VITE_GOOGLE_SITE_VERIFICATION as string | undefined) ?? '',
  bingSiteVerification: '',
  // Cookie-less analytics. Cloudflare Web Analytics token (free, no consent banner needed).
  cloudflareAnalyticsToken: '',
};

/** Founder, leadership and instructors. The leadership section on About and the instructor blocks on course pages
 *  render only when this list has entries; until then the pages describe how instructors are selected. */
export const TEAM: TeamMember[] = [];

export const addressLines = () => {
  const a = BRAND.address;
  return [BRAND.name, a.line1, a.line2, `${a.city}, ${a.region} ${a.postalCode}`, a.country].filter(Boolean);
};
export const addressText = () => addressLines().slice(1).join(', ');
export const mapUrl = () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${BRAND.name}, ${addressText()}`)}`;
/** Further offices: printable lines (empty parts dropped) and a map link. */
export const otherLocations = () => BRAND.locations.map((l) => {
  const lines = [l.line1, l.line2, [l.city, [l.region, l.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', '), l.country].filter(Boolean);
  return { ...l, lines, map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${BRAND.name}, ${lines.join(', ')}`)}` };
});

/** Identity details that still need the owner's input (printed by the build; never shown on the site). */
export function launchChecklist(): string[] {
  const todo: string[] = [];
  if (!BRAND.legalName) todo.push('BRAND.legalName (registered company name, optional)');
  if (!BRAND.phone) todo.push('BRAND.phone (optional)');
  if (!BRAND.socials.length) todo.push('BRAND.socials (optional)');
  if (!TEAM.length) todo.push('TEAM (founder, leadership and instructor profiles)');
  if (!INTEGRATIONS.formEndpoint && INTEGRATIONS.formProvider === 'formsubmit') todo.push('Forms use FormSubmit (no account): after launch, send one test message to contact@, help@ and support@ and click "Activate Form" in each inbox');
  if (BRAND.locations.some((l) => !l.line1)) todo.push('BRAND.locations: full street address for ' + BRAND.locations.filter((l) => !l.line1).map((l) => l.label).join(', '));
  if (!INTEGRATIONS.googleSiteVerification) todo.push('INTEGRATIONS.googleSiteVerification (Search Console; or verify by DNS)');
  return todo;
}
