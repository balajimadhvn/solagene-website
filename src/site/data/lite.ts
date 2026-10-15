// Typed access to the generated site index (site-index.json, written by scripts/site-index.mjs). Small enough to
// load on every page: menus, cards and listings use it; full content is imported only by detail pages.
import INDEX from './site-index.json';
import type { Format, LiteCourse } from './course-types';

export interface LiteProduct { slug: string; name: string; line: string; tagline: string; short: string; shot: string; app: string }
export interface LiteService { slug: string; title: string; short: string; category: string; status: 'available' | 'on-request' | 'planned'; discipline: 'dry' | 'wet' }
export interface LiteInternship { slug: string; title: string; short: string; mode: string; discipline: 'dry' | 'wet' | 'hybrid'; weeks: number[]; from: number; options: { label: string; weeks: number; fee: number }[] }
export interface LiteArticle { slug: string; title: string; description: string; category: string; published: string; updated?: string; minutes: number; keywords: string[]; course?: string; author?: string }
export interface LiteTool { slug: string; name: string; short: string; glyph: string; group: string; keywords: string[] }

export const COURSES = INDEX.courses as unknown as LiteCourse[];
export const PRODUCTS = INDEX.products as LiteProduct[];
export const SERVICES = INDEX.services as LiteService[];
export const INTERNSHIPS = INDEX.internships as LiteInternship[];
export const ARTICLES = INDEX.articles as LiteArticle[];
export const TOOLS = INDEX.tools as LiteTool[];

export const liteCourse = (slug: string) => COURSES.find((c) => c.slug === slug);
export const courseBySlug = liteCourse;
export const feeOf = (c: LiteCourse, f: Format) => c.fees[f] ?? null;
export const usdOf = (c: LiteCourse, f: Format) => c.usd[f] ?? null;
export const fromFee = (c: LiteCourse) => c.from;
export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);
export const internshipBySlug = (slug: string) => INTERNSHIPS.find((x) => x.slug === slug);
export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug === slug);
