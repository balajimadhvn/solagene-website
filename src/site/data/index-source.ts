// Source for the generated site index (src/site/data/site-index.json): compact records for menus, cards and
// listings, so the full content of 73 courses, 19 services, 15 products and 16 articles is only loaded on the pages
// that show it. Built by scripts/site-index.mjs; never imported by the app.
import { ARTICLES } from './articles';
import { COURSES, toLite } from './courses-all';
import { INTERNSHIPS, internshipFrom } from './internships';
import { PRODUCTS } from './products';
import { readingMinutes } from './reading';
import { SERVICES, statusOf } from './services';
import { TOOLS } from './tools';

export function buildIndex() {
  return {
    courses: COURSES.map(toLite),
    products: PRODUCTS.map((p) => ({ slug: p.slug, name: p.name, line: p.line, tagline: p.tagline, short: p.short, shot: p.shot, app: p.app })),
    services: SERVICES.map((s) => ({ slug: s.slug, title: s.title, short: s.short, category: s.category, status: statusOf(s), discipline: s.discipline ?? 'dry' })),
    internships: INTERNSHIPS.map((x) => ({ slug: x.slug, title: x.title, short: x.short, mode: x.mode, discipline: x.discipline, weeks: [...new Set(x.options.map((o) => o.weeks))], from: internshipFrom(x), options: x.options })),
    articles: ARTICLES.map((a) => ({ slug: a.slug, title: a.title, description: a.description, category: a.category, published: a.published, updated: a.updated, minutes: readingMinutes(a.body), keywords: a.keywords, course: a.course, author: a.author })),
    tools: TOOLS.map((t) => ({ slug: t.slug, name: t.name, short: t.short, glyph: t.glyph, group: t.group, keywords: t.keywords })),
  };
}
