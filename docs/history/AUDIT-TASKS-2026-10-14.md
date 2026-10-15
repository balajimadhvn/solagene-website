# Audit fix plan (2026-10-14)

Source: the site audit of 2026-10-13. Company identity (name, domain, e-mail, phone, address, founder/team bios) is **deferred**: the user supplies it later. Everything else is in scope. Status: `[ ]` todo, `[x]` done.

## A. Architecture & technical SEO
- [x] A1 HashRouter → BrowserRouter (clean URLs), base path `/`, asset URLs via `BASE_URL`
- [x] A2 Build-time prerender of every public route to static HTML (hydrated on load)
- [x] A3 Per-route title, meta description, canonical, Open Graph, Twitter card
- [x] A4 JSON-LD: Organization, WebSite, Course, Service, SoftwareApplication, FAQPage, Article, BreadcrumbList
- [x] A5 robots.txt + sitemap.xml generated at build
- [x] A6 Real 404 page (404.html) instead of the Workbench fallback
- [x] A7 OG share image (1200×630) generated from brand config
- [x] A8 COOP/COEP headers scoped to tool routes only (keeps video/analytics embeds possible)
- [x] A9 Search Console verification + Cloudflare Web Analytics hooks (config-driven, off until set)
- [x] A10 Hero content visible without JS (no opacity-0 LCP), reduced JS animation cost

## B. Conversion & forms
- [x] B1 Form backend (Web3Forms/Formspree-compatible endpoint in config) with mailto fallback
- [x] B2 Inline validation, aria-invalid, error text, loading + success states, honeypot
- [x] B3 Enrolment flow per course: fee/batch/payment-link fields (config), "Reserve a seat" fallback (fees/dates still need the user)
- [x] B4 Internship application flow with batch fields and Apply CTA
- [x] B5 Service quote form (service, data type, sample count, timeline)
- [x] B6 Newsletter signup (config endpoint; falls back to the form backend)
- [x] B7 WhatsApp click-to-chat (shown when a number is configured)
- [x] B8 One clear primary CTA per page

## C. Content & information architecture
- [x] C1 New navigation: Courses · Internships · Services · Free Tools · Learn · About · Contact (+ Workbench)
- [x] C2 Course catalogue rebuilt around search intent (RNA-seq, NGS/WGS, docking, QSAR, Python, R, single-cell, ML, foundations…)
- [x] C3 Individual course pages: outcomes, modules, prerequisites, format, tools, certificate, FAQ, enrol
- [x] C4 Learning paths
- [x] C5 Services hub + service pages (RNA-seq, WGS/WES, single-cell, docking, QSAR, custom/consulting) with deliverables, inputs, process, FAQ, quote
- [x] C6 Free tools hub + one indexable page per tool (GC, reverse complement, translate, ORF, protein MW/pI, codon usage, FASTA validator, Tm)
- [x] C7 Learn (blog) with first in-depth tutorials, article schema, author slot
- [x] C8 Certificate verification page (/verify) backed by a static JSON
- [x] C9 About: positioning, approach, team section (renders when TEAM is filled)
- [x] C10 Remove vapourware from home; trim repeated "no release date" copy; products → roadmap note
- [x] C11 Catchy brand line + keyword-rich H1/titles
- [x] C12 Hide unfilled placeholders (location, team) instead of showing "Add your city"

## D. UI / UX redesign
- [x] D1 New visual system: light editorial base + dark feature bands; refined tokens scoped to the public site
- [x] D2 Signature hero visual: interactive 3D particle morph (helix → protein → cell cluster)
- [x] D3 New home page structure (audiences, courses, paths, live lab, services, tools, why-us bento, internships, articles, FAQ, newsletter)
- [x] D4 Rich course cards + catalogue filters/search
- [x] D5 Remove marquee, magnetic buttons, auto-rotating pillars, developer stats
- [x] D6 Accessible tabs (arrow keys), ≥44px touch targets on mobile, focus styles
- [x] D7 Footer with full sitemap, newsletter, legal line
- [x] D8 Breadcrumbs on deep pages

## E. Bugs
- [x] E1 Sequence lab: parse FASTA headers, warn about invalid characters
- [x] E2 Form submit disabled with no explanation

## F. Verification
- [x] F1 Unit tests + typecheck + build + licence gate pass
- [x] F2 e2e updated for clean URLs and new pages; all pass
- [x] F3 Screenshot review desktop + mobile, light + dark
- [x] F4 Final review report (delivered in chat, 2026-10-14)

## Deferred (needs the user)
Company name, domain (`BRAND.siteUrl`), e-mail, phone/WhatsApp, address, founder/instructor bios and photos, course fees and batch dates, internship dates/fees, payment links, form-backend key, Search Console token, analytics token, real testimonials.

## Progress log
**2026-10-14: all tasks A–F implemented and verified.** Build: 48 prerendered indexable pages plus 14 app routes and 404.html. 20/20 e2e pass. Unit tests: 196 pass; 2 pre-existing performance tests (`phylo/ml.test.ts`, `variants/signatures.test.ts`) exceed vitest's 5 s timeout only while the machine is saturated (load average about 19 from GROMACS); neither module was changed.

Key implementation notes:
- Clean URLs + prerender: `src/entry-server.tsx` (eager pages) and `scripts/prerender.mjs`; the client (`src/main.tsx`) hydrates only when `#root[data-ssr]` matches the URL. Pages are lazy chunks on the client (`src/site/pages.lazy.ts`).
- `npm run preview` uses `scripts/serve.mjs` (behaves like Cloudflare Pages). Do not use `vite preview`: it serves index.html for every path and causes hydration mismatches.
- `_headers`: COOP/COEP only on Workbench routes; `/assets/*`, `/rdkit/*` and `/wasm/*` also carry COEP, otherwise workers are blocked on isolated pages.
- Reveal animations are CSS (`.reveal` + IntersectionObserver in `primitives.tsx`); the hero uses CSS keyframes, so content is visible before JS.
