// Small shared constants used by menus, cards and listings. Kept apart from the content modules so that importing
// them never pulls in full course, service or product content.
export type ServiceCategory = 'Genomics & transcriptomics' | 'Structure & drug discovery' | 'Data science & engineering' | 'Bio-IT & software' | 'Wet-lab services';
export const SERVICE_CATEGORIES: ServiceCategory[] = ['Genomics & transcriptomics', 'Structure & drug discovery', 'Data science & engineering', 'Bio-IT & software', 'Wet-lab services'];
export type ServiceStatus = 'available' | 'on-request' | 'planned';
export const STATUS_LABEL: Record<ServiceStatus, string> = { available: 'Available now', 'on-request': 'On request', planned: 'Planned' };
export const STATUS_NOTE: Record<ServiceStatus, string> = { available: 'Accepting projects now.', 'on-request': 'Offered case by case; availability is confirmed when you enquire.', planned: 'This service opens with our laboratory. Register your interest and we will contact you when it does.' };
export type ProductLine = 'Platform' | 'Genomics & transcriptomics' | 'Chemistry & structure' | 'Evolution & microbiome' | 'Knowledge & reporting';
export const PRODUCT_LINES: ProductLine[] = ['Platform', 'Genomics & transcriptomics', 'Chemistry & structure', 'Evolution & microbiome', 'Knowledge & reporting'];

/** The application and selection process shared by every internship. */
export const INTERN_PROCESS = [
  { t: 'Apply online', d: 'Complete the application form with your academic details, track and duration, and a statement of purpose. It takes about ten minutes.' },
  { t: 'Screening', d: 'An admissions reviewer reads every application and replies within five working days, by e-mail.' },
  { t: 'Short task', d: 'Shortlisted applicants receive a track-specific task: a small analysis, a reading-and-reasoning exercise or a protocol question. It is designed to take two to three hours.' },
  { t: 'Interview', d: 'A 20-minute online conversation about your motivation, your task and how you approach problems.' },
  { t: 'Offer and onboarding', d: 'Successful applicants receive an offer letter with the start date, mentor, project area and fee. Your place is confirmed when the fee is paid.' },
  { t: 'Internship and review', d: 'Weekly mentor reviews, a mid-point check and a final presentation, followed by your certificate.' },
];

export const PLATFORMS = ['Chrome, Edge, Firefox and Safari (current versions)', 'Windows, macOS, Linux and ChromeOS', 'No installation, no account, no upload'];

/** In development: shown as a roadmap, never as available products. */
export const ROADMAP = [
  { name: 'Nayancode Analysis Copilot', stage: 'Prototype', body: 'An assistant that turns a plain-language question into a reproducible workflow you can read, rerun and cite, with every step visible.' },
  { name: 'Nayancode Pipeline Cloud', stage: 'Research', body: 'Managed execution of heavy pipelines that exceed what a browser should attempt, with results flowing back into the studios.' },
  { name: 'Nayancode Molecule Intelligence', stage: 'Research', body: 'Learned property and interaction models built on the QSAR discipline already enforced in Chemistry Studio.' },
  { name: 'Nayancode Lab', stage: 'Research', body: 'Sample tracking and laboratory records designed for teaching and small research laboratories.' },
];

/** Licensing (no prices are fixed yet; institutional terms are quoted on request). */
export const LICENSING = [
  { name: 'Public preview', price: 'Free', for: 'Students, researchers and educators', points: ['All live studios and free tools in the browser', 'No account and no upload', 'Community documentation', 'Fair use: please cite Nayancode in publications'], cta: { label: 'Open the Workbench', to: '/workbench' } },
  { name: 'Academic & teaching', price: 'Free for classrooms', for: 'Departments running courses and workshops', points: ['Everything in the public preview', 'Teaching datasets and exercises from Vedicgen', 'Help planning classroom use', 'Optional instructor training (quoted)'], cta: { label: 'Talk to us about teaching', to: '/nayancode/demo?topic=teaching' } },
  { name: 'Institutional & enterprise', price: 'On request', for: 'Institutes, biotech and pharma teams', points: ['Self-hosted deployment inside your network', 'Custom studios, integrations and branding', 'Priority support and service levels', 'Security and validation documentation'], cta: { label: 'Request a quote', to: '/nayancode/demo?topic=enterprise' } },
];
