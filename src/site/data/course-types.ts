// Shared course types, fee defaults and FAQ entries for the Vedicgen catalogue. The catalogue itself is assembled in
// courses.ts from three schools: courses-bioinfo*.ts (dry lab), courses-biotech.ts (wet lab), courses-life.ts.
//
// FEES (business decisions, set after the market comparison in docs/PRICING-RESEARCH.md): all amounts are in INR and
// exclusive of 18% GST. Dry-lab courses take their fee from the tier defaults below unless a course sets `fees`.
// Wet-lab and life-science courses set their own fees. Change a number here and every page, card, pricing table and
// Course JSON-LD updates.
import type { FigureKind } from '../figures';

export type Level = 'Beginner' | 'Intermediate' | 'Advanced';
export type School = 'bioinformatics' | 'computing' | 'biotechnology' | 'life-sciences';
export type Discipline = 'dry' | 'wet' | 'hybrid';
/** self-paced: recorded lessons + labs + mentor-reviewed capstone · live: instructor-led online cohort · in-person: bench training in our laboratory. */
export type Format = 'self-paced' | 'live' | 'in-person';
export type Tier = 'foundation' | 'core' | 'advanced';
export type Category =
  | 'Foundations' | 'Programming & data' | 'Genomics & transcriptomics' | 'Structural biology & drug discovery' | 'AI & machine learning' | 'Microbial & evolutionary genomics' | 'Systems & multi-omics'
  | 'Molecular biology' | 'Genetic engineering' | 'Cell & tissue culture' | 'Microbiology' | 'Protein & immunotechniques' | 'Bioprocess & analytical'
  | 'Scientific programming' | 'Algorithms & software engineering' | 'DevOps & cloud' | 'Data science & AI' | 'Computational physics & chemistry' | 'Chemo- & materials informatics' | 'Geoinformatics' | 'Health & lab informatics'
  | 'Life science foundations' | 'Research & professional skills';

export interface Module { title: string; topics: string[]; lab: string }
export interface Dataset { name: string; source: string; use: string }
export interface QA { q: string; a: string }

export interface CourseInput {
  slug: string;
  title: string;
  /** Search-intent title for <title> (≤ 60 characters including the brand suffix). */
  seoTitle: string;
  seoDescription: string;
  level: Level;
  category: Category | 'Foundations' | 'Programming' | 'Genomics' | 'Drug discovery' | 'AI & data' | 'Evolution & ecology';
  school?: School;
  discipline?: Discipline;
  tier?: Tier;
  formats?: readonly Format[];
  /** Length of the live or in-person format, in weeks (wet-lab courses use days). */
  weeks?: number;
  days?: number;
  /** Guided contact hours (live sessions, lab clinics or bench time). */
  hours?: number;
  fees?: Partial<Record<Format, number>>;
  usd?: Partial<Record<Format, number>>;
  short: string;
  intro: string;
  description: string[];
  forWho: string[];
  prerequisites: string[];
  eligibility?: string[];
  outcomes: string[];
  skills: string[];
  modules: Module[];
  tools: string[];
  /** Wet lab: instruments and techniques performed at the bench. */
  techniques?: string[];
  datasets?: Dataset[];
  /** Wet lab: biological material and kits used. */
  materials?: string[];
  readings: string[];
  project: { title: string; body: string };
  setup?: string;
  studio?: { label: string; to: string };
  faq: QA[];
  keywords: string[];
  featured?: boolean;
  figure: FigureKind;
}

export interface Course extends CourseInput {
  category: Category;
  school: School;
  discipline: Discipline;
  tier: Tier;
  formats: readonly Format[];
  hours: number;
  eligibility: string[];
}

export const FORMAT_LABEL: Record<Format, string> = { 'self-paced': 'Self-paced online', live: 'Live online cohort', 'in-person': 'In-person, hands-on' };
export const FORMAT_SHORT: Record<Format, string> = { 'self-paced': 'Self-paced', live: 'Live online', 'in-person': 'In-person lab' };
export const FORMAT_NOTE: Record<Format, string> = {
  'self-paced': 'Recorded lessons, the same labs and datasets, a discussion forum, and a capstone reviewed by a mentor. Six months of access.',
  live: 'Instructor-led sessions three times a week, a weekly lab clinic, recordings of every session and an assessed capstone project.',
  'in-person': 'Bench training in our laboratory, in a small group, with all reagents, consumables and personal protective equipment included.',
};

export const TIER_FEES: Record<Tier, Partial<Record<Format, number>>> = {
  foundation: { 'self-paced': 3499, live: 8499 },
  core: { 'self-paced': 4499, live: 10999 },
  advanced: { 'self-paced': 5999, live: 12499 },
};
export const TIER_USD: Record<Tier, Partial<Record<Format, number>>> = {
  foundation: { 'self-paced': 59, live: 149 },
  core: { 'self-paced': 79, live: 189 },
  advanced: { 'self-paced': 99, live: 219 },
};
export const GST = 0.18;

/**
 * DURATION POLICY: no course runs longer than MAX_WEEKS, and every duration is customisable. The schedule options are
 * offered on every course application form; the notes are shown on course and programme pages.
 */
export const MAX_WEEKS = 4;
export const SCHEDULES = ['Standard (up to 4 weeks)', 'Intensive (1–2 weeks)', 'Weekends only', 'Custom schedule (tell us in your message)'] as const;
export const FLEX_NOTE = 'Duration is customisable: take the standard schedule (4 weeks at most), an intensive 1–2 week schedule or weekends only. Colleges and teams can set their own timetable.';
export const WET_FLEX_NOTE = 'Duration is customisable: run the bench days back to back, or spread them over weekends within 4 weeks. Colleges and teams can book their own dates.';
export const PROGRAM_FLEX_NOTE = 'Pace is customisable: fast-track by taking courses back to back, or go part-time and spread them out. You agree the order and pace of courses with your mentor when you join.';
export const FLEX: QA = { q: 'Can I change the duration or schedule?', a: 'Yes. No course runs longer than four weeks, and the length is customisable: choose the standard schedule, an intensive one- to two-week schedule, weekends only, or a custom timetable. Pick your preference on the application form; colleges and teams can book their own dates.' };

export const DRY_ELIGIBILITY = [
  'Students and graduates of B.Sc., M.Sc., B.Tech., M.Tech., B.Pharm., M.Pharm., MBBS, BDS, B.V.Sc. or a PhD programme in the life sciences, biotechnology, bioinformatics, pharmacy, medicine, agriculture, chemistry, statistics or computer science',
  'Researchers, faculty and industry professionals moving into data-driven biology',
  'Final-year students may apply before their results are declared',
];
export const COMPUTING_ELIGIBILITY = [
  'Students and graduates in any science, engineering, pharmacy, medicine, agriculture, geography or computing programme (B.Sc., B.Tech., B.E., BCA, M.Sc., M.Tech., MCA, PhD)',
  'Researchers, faculty and working professionals in research, healthcare, biotech, pharma or IT who want to apply computing to science',
  'Final-year students may apply before their results are declared',
];
export const WET_ELIGIBILITY = [
  'Students and graduates of B.Sc., M.Sc., B.Tech., M.Tech., B.Pharm., M.Pharm. or a PhD programme in biotechnology, microbiology, biochemistry, molecular biology, genetics, life sciences, pharmacy or allied health sciences',
  'Laboratory staff, research assistants and faculty who want structured bench training',
  'Participants must be 18 or older and follow the laboratory safety induction on day one',
];
export const LIFE_ELIGIBILITY = [
  'Undergraduate and postgraduate students in any life-science, health-science, agriculture or pharmacy programme',
  'Graduates preparing for research positions, higher studies or a move into biotechnology',
  'Professionals from adjacent fields (engineering, computing, chemistry) who need a working command of biology',
];

export const CERT: QA = { q: 'Do I get a certificate?', a: 'Yes. Learners who complete the course and pass its assessment receive a Vedicgen certificate of completion, issued by Vivofold. Every certificate carries a unique ID and a QR code that anyone, including an employer or admissions office, can check on the certificate verification page.' };
export const DATES: QA = { q: 'When does the next cohort start, and how do I enrol?', a: 'Apply with the form on this page. Live and in-person cohorts run through the year; the dates, timetable and joining details of the next cohort are sent with your admission offer and listed on this page once announced. Self-paced enrolment opens as soon as your application is accepted.' };
export const FORMAT: QA = { q: 'How is the course taught?', a: 'In the live cohort, modules are taught in instructor-led sessions with a weekly lab clinic where you work on real public data with help at hand; every session is recorded. The self-paced format uses the same lessons, labs and datasets with mentor review of your capstone. Both formats end with an assessed project reviewed for the code and the science.' };
export const SETUP = (extra = ''): QA => ({ q: 'What computer do I need?', a: `A laptop with at least 8 GB of RAM and about 30 GB of free disk space, running Linux, macOS, or Windows with WSL2.${extra} Installation instructions are sent before the first session, and lab clinics help with any set-up problems.` });
export const WET_SAFETY: QA = { q: 'Is the laboratory work safe for beginners?', a: 'Yes. Day one starts with a safety induction covering personal protective equipment, safe handling of reagents and biological material, spill response and waste segregation. All practicals use non-pathogenic material (Risk Group 1 organisms, established cell lines or synthetic templates) and are supervised throughout.' };
export const WET_INCLUDED: QA = { q: 'What does the fee include?', a: 'All reagents, kits, consumables, personal protective equipment, the lab manual and the certificate. Travel, accommodation and meals are not included. The laboratory address and joining instructions are sent with your admission letter.' };
export const LIFE_FORMAT: QA = { q: 'How is the course delivered?', a: 'Online. The live cohort meets for instructor-led sessions with problem-solving in small groups; the self-paced format offers the same lessons with quizzes and a mentor-reviewed final assignment.' };

/* ---------- schools, labels and pure helpers (no catalogue data, safe to import anywhere) ---------- */
export interface SchoolDef { id: School; name: string; short: string; line: string; categories: Category[] }
export const SCHOOLS: SchoolDef[] = [
  { id: 'bioinformatics', name: 'School of Bioinformatics', short: 'Bioinformatics', line: 'Genomics, transcriptomics, structural biology, drug discovery and AI for biology, on real public data.', categories: ['Foundations', 'Programming & data', 'Genomics & transcriptomics', 'Systems & multi-omics', 'Structural biology & drug discovery', 'Microbial & evolutionary genomics', 'AI & machine learning'] },
  { id: 'biotechnology', name: 'School of Biotechnology', short: 'Biotechnology (wet lab)', line: 'Hands-on bench training in our laboratory: molecular biology, cloning, proteins, cell culture, microbiology and bioprocess.', categories: ['Molecular biology', 'Genetic engineering', 'Protein & immunotechniques', 'Cell & tissue culture', 'Microbiology', 'Bioprocess & analytical'] },
  { id: 'computing', name: 'School of Scientific Computing & Informatics', short: 'Computing & informatics', line: 'Programming, algorithms, DevOps and cloud, data and AI engineering, computational physics and chemistry, geoinformatics and health informatics.', categories: ['Scientific programming', 'Algorithms & software engineering', 'DevOps & cloud', 'Data science & AI', 'Chemo- & materials informatics', 'Computational physics & chemistry', 'Geoinformatics', 'Health & lab informatics'] },
  { id: 'life-sciences', name: 'School of Life Sciences', short: 'Life sciences', line: 'Foundations and research skills: molecular biology, genetics, biochemistry, statistics, writing, quality and regulation.', categories: ['Life science foundations', 'Research & professional skills'] },
];
export const schoolOf = (id: School) => SCHOOLS.find((s) => s.id === id)!;
export const CATEGORIES: Category[] = SCHOOLS.flatMap((s) => s.categories);
export const CATEGORY_LABEL: Record<Category, string> = Object.fromEntries(CATEGORIES.map((c) => [c, c])) as Record<Category, string>;
export const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced'];
export const DISCIPLINE_LABEL = { dry: 'Dry lab', wet: 'Wet lab', hybrid: 'Wet + dry' } as const;
export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
export const withGst = (n: number) => Math.round(n * (1 + GST));
export const durationOf = (c: { days?: number; weeks?: number; hours: number }, f: Format) => (f === 'self-paced' ? 'Self-paced, 6 months of access' : c.days ? `${c.days} days, ${c.hours} hours at the bench (customisable)` : `Up to ${c.weeks} weeks, about ${c.hours} hours live (customisable)`);
/** Short duration label for cards and fact boxes. */
export const durationShort = (c: { days?: number; weeks?: number }) => (c.days ? `${c.days} days` : `Up to ${c.weeks} weeks`);

/** Compact course record used by menus, cards and listings (generated into site-index.json at build time). */
export interface LiteCourse { slug: string; title: string; figure: FigureKind; short: string; school: School; category: Category; discipline: Discipline; level: Level; tier: Tier; formats: Format[]; fees: Partial<Record<Format, number>>; usd: Partial<Record<Format, number>>; from: number; customFee: boolean; days?: number; weeks?: number; hours: number; featured?: boolean; search: string }
