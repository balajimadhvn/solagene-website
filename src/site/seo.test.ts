// Keeps the search metadata and structured data valid as pages and data change. The rules come from Google's
// documentation (docs/SEO-RESEARCH-2026.md): Course needs name + description + provider, an ItemList needs
// position + url, logos are at least 112 px, and nothing may be marked up that the site cannot back up
// (no ratings, reviews or job postings: internships charge a fee, which Google's job-posting policy forbids).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BRAND } from '@/core/brand';
import { clip, fullTitle, headHtml, metaFor, siteRoutes } from './seo';

type J = Record<string, any>;
const routes = siteRoutes();
const metas = routes.map((r) => metaFor(r)!);
const nodes = (m: { jsonLd: J[] }, type: string) => m.jsonLd.filter((n) => [n['@type']].flat().includes(type));
const walk = (v: unknown, f: (o: J) => void) => { if (Array.isArray(v)) v.forEach((x) => walk(x, f)); else if (v && typeof v === 'object') { f(v as J); Object.values(v as J).forEach((x) => walk(x, f)); } };
const isAbs = (u: string) => u.startsWith(`${BRAND.siteUrl}/`) || u === BRAND.siteUrl;

describe('titles and descriptions', () => {
  it('every route has metadata', () => { expect(metas.every(Boolean)).toBe(true); });
  it('titles are distinct, specific and fit the results page', () => {
    const seen = new Map<string, string>();
    for (const m of metas) {
      const t = fullTitle(m);
      expect(t.length, `${m.path}: "${t}"`).toBeGreaterThanOrEqual(20);
      expect(t.length, `${m.path}: "${t}"`).toBeLessThanOrEqual(66);
      expect(seen.has(t), `${m.path} repeats the title of ${seen.get(t)}`).toBe(false);
      seen.set(t, m.path);
    }
  });
  it('hub descriptions fit a result snippet; all descriptions are distinct', () => {
    const seen = new Map<string, string>();
    for (const m of metas) {
      const d = clip(m.description);
      expect(d.length, m.path).toBeGreaterThanOrEqual(70);
      expect(m.description.length, `${m.path}: description longer than a result can show`).toBeLessThanOrEqual(200);
      if (!/^\/(vedicgen\/(courses|programs|internships)|nayancode\/(products|tools)|services|research|learn)\/./.test(m.path)) expect(d.endsWith('…'), `${m.path}: description is clipped mid-sentence: ${d}`).toBe(false);
      expect(seen.has(d), `${m.path} repeats the description of ${seen.get(d)}`).toBe(false);
      seen.set(d, m.path);
    }
  });
  it('hub pages carry the words people search for', () => {
    const t = (p: string) => fullTitle(metaFor(p)!).toLowerCase();
    expect(t('/')).toMatch(/bioinformatics courses/);
    expect(t('/vedicgen/courses')).toMatch(/bioinformatics.*courses.*india/);
    expect(t('/vedicgen/internships')).toMatch(/bioinformatics internships/);
    expect(t('/vedicgen/programs')).toMatch(/certificate programmes/);
    expect(t('/vedicgen/workshops')).toMatch(/workshops/);
    for (const p of ['/vedicgen', '/vedicgen/courses', '/vedicgen/programs', '/vedicgen/internships', '/vedicgen/workshops', '/nayancode']) expect(t(p), p).toMatch(/solagene/);
  });
  it('head tags: one canonical, hreflang, robots', () => {
    const h = headHtml(metaFor('/vedicgen/courses')!);
    expect(h).toContain('<link rel="canonical" href="https://solagene.com/vedicgen/courses/" />');
    expect(h).toContain('hreflang="en-IN" href="https://solagene.com/vedicgen/courses/"');
    expect(h).toContain('max-image-preview:large');
  });
});

describe('structured data', () => {
  it('serialises to valid JSON-LD with an https absolute URL for every url / item / logo', () => {
    for (const m of metas) {
      const parsed = JSON.parse(JSON.stringify({ '@context': 'https://schema.org', '@graph': m.jsonLd }));
      walk(parsed, (o) => { for (const k of ['url', 'item', 'serviceUrl']) if (typeof o[k] === 'string') expect(isAbs(o[k]), `${m.path}: ${k}=${o[k]}`).toBe(true); });
    }
  });
  it('never marks up what the site cannot support', () => {
    for (const m of metas) walk(m.jsonLd, (o) => {
      const types = [o['@type']].flat();
      for (const bad of ['AggregateRating', 'Review', 'Rating', 'JobPosting']) expect(types, `${m.path} has ${bad}`).not.toContain(bad);
      expect(o.aggregateRating, m.path).toBeUndefined();
      expect(o.review, m.path).toBeUndefined();
    });
  });
  it('Organization: logo is a crawlable image of at least 112 px; sameAs only lists configured profiles', () => {
    const org = nodes(metaFor('/')!, 'Organization')[0];
    expect(org.logo.width).toBeGreaterThanOrEqual(112);
    expect(org.logo.height).toBeGreaterThanOrEqual(112);
    const file = new URL(org.logo.url).pathname;
    expect(existsSync(`public${file}`), `public${file}`).toBe(true);
    expect(org.sameAs ?? []).toEqual(BRAND.socials.map((s) => s.url));
    expect(org.address).toBeTruthy();
  });
  it('home has a WebSite node with the site name', () => {
    const w = nodes(metaFor('/')!, 'WebSite')[0];
    expect(w.name).toBe(BRAND.name);
  });
  it('every course page has a valid Course with provider, instances and INR offers', () => {
    const courses = routes.filter((r) => /^\/vedicgen\/courses\/./.test(r));
    expect(courses.length).toBeGreaterThanOrEqual(3);
    for (const r of courses) {
      const m = metaFor(r)!, c = nodes(m, 'Course')[0];
      expect(c, r).toBeTruthy();
      expect(c.name, r).toBeTruthy(); expect(c.description, r).toBeTruthy();
      expect(c.name, `${r}: promotional wording in the course name`).not.toMatch(/₹|\d+% off|discount|buy now|enrol now|free trial/i);
      expect(c.provider.name, r).toBe(BRAND.name);
      expect(c.hasCourseInstance.length, r).toBeGreaterThan(0);
      for (const i of c.hasCourseInstance) { expect(['Online', 'Onsite', 'Blended'], r).toContain(i.courseMode); expect(i.courseWorkload, r).toMatch(/^PT\d+H$/); }
      const inr = [c.offers].flat().filter((o: J) => o.priceCurrency === 'INR');
      expect(inr.length, r).toBe(c.hasCourseInstance.length);
      for (const o of inr) expect(Number(o.price), r).toBeGreaterThan(0);
      expect(nodes(m, 'BreadcrumbList').length, r).toBe(1);
    }
  });
  it('the course list is an ItemList of unique canonical course URLs (carousel eligible)', () => {
    const m = metaFor('/vedicgen/courses')!, l = nodes(m, 'ItemList')[0];
    const urls = l.itemListElement.map((e: J) => e.url);
    expect(urls.length).toBeGreaterThanOrEqual(3);
    expect(new Set(urls).size).toBe(urls.length);
    l.itemListElement.forEach((e: J, i: number) => { expect(e.position).toBe(i + 1); expect(urls[i]).toMatch(/^https:\/\/solagene\.com\/vedicgen\/courses\/[a-z0-9-]+\/$/); });
  });
  it('programmes and internships are EducationalOccupationalProgram with a provider and offers', () => {
    for (const r of routes.filter((x) => /^\/vedicgen\/(programs|internships)\/./.test(x))) {
      const p = nodes(metaFor(r)!, 'EducationalOccupationalProgram')[0];
      expect(p, r).toBeTruthy();
      expect(p.provider.name, r).toBe(BRAND.name);
      expect([p.offers].flat().length, r).toBeGreaterThan(0);
    }
  });
  it('breadcrumbs start at Home and end at the page itself', () => {
    for (const m of metas.filter((x) => x.path !== '/')) {
      const b = nodes(m, 'BreadcrumbList')[0];
      if (!b) continue;
      const items = b.itemListElement;
      expect(items[0].name, m.path).toBe('Home');
      expect(items[items.length - 1].item, m.path).toBe(`${BRAND.siteUrl}${m.path}/`);
    }
  });
  it('every @id reference resolves inside the page graph', () => {
    for (const m of metas) {
      const defined = new Set<string>(); const used: string[] = [];
      walk(m.jsonLd, (o) => { if (o['@id']) { if (Object.keys(o).length > 1 || [o['@type']].flat().length) defined.add(o['@id']); else used.push(o['@id']); } });
      for (const u of used) expect(defined.has(u), `${m.path}: dangling @id ${u}`).toBe(true);
    }
  });
});

describe('crawl files', () => {
  it('the IndexNow key file exists and contains only its key', () => {
    const keys = readdirSync('public').filter((f) => /^[a-f0-9]{32}\.txt$/.test(f));
    expect(keys.length).toBe(1);
    expect(readFileSync(`public/${keys[0]}`, 'utf8').trim()).toBe(keys[0].replace('.txt', ''));
    expect(readFileSync('scripts/indexnow.mjs', 'utf8')).toContain(keys[0].replace('.txt', ''));
  });
});
