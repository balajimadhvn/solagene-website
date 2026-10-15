// Vedicgen catalogue (full content): four schools assembled from their own files, plus fee helpers. Heavy: import it
// only where full course content is needed (course pages, SEO). Menus and listings use the generated index (lite.ts).
// Commercial batch details (start date, timetable, seats, payment link, named instructor) are set per course in
// BATCHES below when a cohort is announced; until then pages say the dates are sent with the admission offer.
import { BIOINFO_CORE } from './courses-bioinfo';
import { BIOINFO_MORE } from './courses-bioinfo2';
import { BIOINFO_EMERGING } from './courses-bioinfo3';
import { BIOTECH } from './courses-biotech';
import { COMPUTING } from './courses-computing';
import { LIFE } from './courses-life';
import {
  COMPUTING_ELIGIBILITY, DRY_ELIGIBILITY, LIFE_ELIGIBILITY, FLEX, MAX_WEEKS, TIER_FEES, TIER_USD, WET_ELIGIBILITY,
  type Category, type Course, type CourseInput, type Format, type LiteCourse, type Level, type School, type Tier,
} from './course-types';

const LEGACY: Record<string, Category> = { Foundations: 'Foundations', Programming: 'Programming & data', Genomics: 'Genomics & transcriptomics', 'Drug discovery': 'Structural biology & drug discovery', 'AI & data': 'AI & machine learning', 'Evolution & ecology': 'Microbial & evolutionary genomics' };
const TIER_OF: Record<Level, Tier> = { Beginner: 'foundation', Intermediate: 'core', Advanced: 'advanced' };
const ELIG: Record<School, string[]> = { bioinformatics: DRY_ELIGIBILITY, computing: COMPUTING_ELIGIBILITY, biotechnology: WET_ELIGIBILITY, 'life-sciences': LIFE_ELIGIBILITY };

function normalise(c: CourseInput): Course {
  const school = c.school ?? 'bioinformatics';
  return {
    ...c,
    school,
    category: (LEGACY[c.category] ?? c.category) as Category,
    discipline: c.discipline ?? 'dry',
    tier: c.tier ?? TIER_OF[c.level],
    formats: c.formats ?? ['live', 'self-paced'],
    weeks: c.days ? undefined : Math.min(c.weeks ?? MAX_WEEKS, MAX_WEEKS),
    hours: c.hours ?? (c.days ? 30 : 32),
    eligibility: c.eligibility ?? ELIG[school],
    faq: [...c.faq, FLEX],
  };
}

export const COURSES: Course[] = [...BIOINFO_CORE, ...BIOINFO_MORE, ...BIOINFO_EMERGING, ...COMPUTING, ...BIOTECH, ...LIFE].map(normalise);
export const courseBySlug = (slug: string) => COURSES.find((c) => c.slug === slug);
export const coursePath = (slug: string) => `/vedicgen/courses/${slug}`;

/* ---------- fees ---------- */
export const feeOf = (c: Course, f: Format): number | null => c.fees?.[f] ?? TIER_FEES[c.tier][f] ?? null;
export const usdOf = (c: Course, f: Format): number | null => (c.discipline === 'wet' || c.discipline === 'hybrid' ? null : c.usd?.[f] ?? TIER_USD[c.tier][f] ?? null);
/** Lowest fee across the formats a course is offered in. */
export const fromFee = (c: Course) => Math.min(...c.formats.map((f) => feeOf(c, f) ?? Infinity));

/**
 * BUSINESS DETAILS per cohort, set when a cohort is announced. Example:
 *   'rna-seq-data-analysis': { start: '2027-01-12', schedule: 'Tue & Thu, 19:00–21:00 IST', seats: 30, paymentUrl: 'https://rzp.io/l/…', instructor: 'Dr A. Example' },
 * The course page, cards and Course JSON-LD update automatically.
 */
export interface Batch { start: string | null; schedule: string | null; seats: number | null; paymentUrl: string | null; instructor: string | null }
const EMPTY: Batch = { start: null, schedule: null, seats: null, paymentUrl: null, instructor: null };
export const BATCHES: Record<string, Partial<Batch>> = {};
export const batchOf = (slug: string): Batch => ({ ...EMPTY, ...BATCHES[slug] });
export const isOpen = (b: Batch) => !!(b.start || b.paymentUrl);

/** Compact record for the generated site index. */
export const toLite = (c: Course): LiteCourse => ({
  slug: c.slug, title: c.title, figure: c.figure, short: c.short, school: c.school, category: c.category, discipline: c.discipline, level: c.level, tier: c.tier, formats: [...c.formats],
  fees: Object.fromEntries(c.formats.map((f) => [f, feeOf(c, f)])), usd: Object.fromEntries(c.formats.map((f) => [f, usdOf(c, f)]).filter(([, v]) => v)), from: fromFee(c), customFee: !!c.fees,
  ...(c.days ? { days: c.days } : {}), ...(c.weeks ? { weeks: c.weeks } : {}), hours: c.hours, ...(c.featured ? { featured: true } : {}),
  search: [c.title, c.short, c.category, ...c.tools, ...(c.techniques ?? []), ...c.keywords, ...c.skills].join(' ').toLowerCase(),
});
