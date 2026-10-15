# Vivofold website: QA report

## Update 2026-10-15: repositioning and redesign
**What changed.** Vivofold now leads as a computational biotechnology company (new `/science/`, `/solutions/`,
`/industry/` pages; rewritten home, About and navigation). Vedicgen and Nayancode moved to a smaller but always-visible
place (top bar, main menu, home, footer). "Available now / In development" tags were removed from company pages.
The template look (gradient text and buttons, pill shapes, glows, hover lifts, Plus Jakarta Sans) was replaced by a
restrained identity in `src/site/refine.css`: IBM Plex only, warm paper and ink, one Vivofold blue, square controls,
hairline rules, quiet purposeful animation (strand-folding hero, discovery-loop diagram, funnel bars), all disabled
under reduced motion. Chennai office added (city only until the street address is supplied). Forms are delivered by
FormSubmit (no account; one activation click per inbox) with an e-mail fallback if delivery fails.

**Audit against "vibe-coded" signals.** The detection tools named in the brief need a public URL (the site is not yet
deployed), so the audit used the signals those tools publish: purple/blue gradients, generic taglines, card grids with
hover effects, emoji, missing SEO tags, stale copyright. Gradients, glows, lifts and generic slogans were removed;
there is no emoji; SEO tags are complete; the copyright year is computed.

**Results.** Build OK (202 pages, 91 redirects, sitemap 189 URLs). Unit tests 198/198. Browser tests 31/31 in GitHub
Pages mode and in normal mode. Full crawl, 606 page views (desktop, tablet, mobile): 0 JS errors, 0 failed requests,
0 broken images, 0 overflow, 0 broken internal links or anchors. Accessibility (axe, WCAG 2.1 AA): 0 violations in light
and dark mode once fade-in animations settle. Lighthouse mobile with gzip: Performance 87–97, Accessibility, Best
Practices and SEO 100 on seven key pages. Sub-path build (`github.io/<repo>/`) crawled clean. External links: doi.org and
businesswire.com block automated checks (both links are valid in a browser).

**Still open (owner).** Chennai street address; one-time FormSubmit activation; e-mail forwarding for contact@, help@,
support@; optional team, phone and social details.

---

## Earlier audit (2026-10-14)

Scope: the whole site (Vivofold, Vedicgen, Nayancode, the Workbench), tested against the **production build** served
exactly as GitHub Pages serves it, with real browsers (Playwright/Chromium), not by reading source code.

## How it was tested
| Method | Coverage |
|---|---|
| Full-site crawler (Playwright) | All 199 URLs (sitemap + Workbench routes) × 3 screen sizes: desktop 1440 px, tablet 820 px, mobile 390 px = **597 page views**. Per page: HTTP status, JS errors, console errors, failed requests, broken images, missing alt text, horizontal overflow, duplicate IDs, one `<h1>`, title/description/canonical/OG, JSON-LD validity, tap-target sizes; every internal link and `#anchor` resolved; all 54 external links fetched. |
| Accessibility (axe-core, WCAG 2.1 A/AA) | Every page on desktop in light mode; 25-page sample in dark mode. |
| Lighthouse 12 (mobile, slow-4G simulation, gzip on like GitHub Pages) | 8 key pages. |
| Interaction scripts | All 11 free tools (example, garbage input, copy), catalogue filters/search/URL state, listings, all 7 mega-menus (71 links), footer (35 links), mobile menu, skip link, theme switch, print view, 404 + deep-link refresh, certificate verification. |
| Forms | Validation on empty submit; full course application → e-mail fallback content checked; **with a form backend configured** (separate build, network intercepted): contact + course application POST correct JSON (subject, reply-to, target inbox, every answer), success message on 200, error + fallback address on 500. |
| Hosting variants | Custom-domain build and **sub-path build** (`https://<account>.github.io/vivofold-website/`), the latter crawled in full. |
| Automated suites | `npm test` 198/198 · `npm run e2e` 29/29 (GitHub Pages mode and normal mode) · `npm run build` OK (licence audit, type-check, 199 prerendered pages, 91 redirects, sitemap 186 URLs). |

## Requested changes made
* **Course durations**: every course is now **at most 4 weeks** (enforced in code by `MAX_WEEKS`; live dry-lab courses 4 weeks / ~32 h; wet-lab courses stay 3–6 days). Durations are **customisable**: each course page shows a "Flexible duration" note and FAQ, cards say "≤ 4 weeks", and every course/programme application form has a *Preferred duration and schedule* choice (Standard ≤ 4 weeks / Intensive 1–2 weeks / Weekends only / Custom).
* **Course prices raised ~20%** (room to negotiate): live ₹8,499 / ₹10,999 / ₹12,499 (was 6,999 / 8,999 / 9,999); self-paced ₹3,499 / ₹4,499 / ₹5,999 (was 2,999 / 3,999 / 4,999); USD 149/189/219 and 59/79/99; wet-lab ₹7,499–₹19,999 (NGS library prep ₹32,999); life sciences ₹4,999 live / ₹2,499 self-paced.
* **Programmes**: prices raised ~20% (₹23,999–₹49,999, still 17–23% below buying the courses separately); length shown as "about N months, customisable" with fast-track / part-time pace explained.
* Internships, workshops and research training were **not** changed (not requested). Old prices are recorded in `docs/PRICING-RESEARCH.md`.

## Bugs found and fixed
| # | Bug | Where | Fix |
|---|---|---|---|
| 1 | Sticky header had **no frosted-glass blur in Chrome/Edge/Firefox/Android** (the CSS minifier dropped the standard `backdrop-filter`), so page text and the dark top bar showed through the header while scrolling | every page | Blur moved to a header pseudo-element (also avoids trapping the mobile menu), header 95% opaque |
| 2 | **404 page threw a React hydration error** for unknown URLs inside a section (e.g. `/vedicgen/courses/xyz/`) | 404 | 404 page renders client-side instead of hydrating |
| 3 | **ORF Finder's own example found nothing** ("No ORF of at least 30 codons") | `/nayancode/tools/orf-finder/` | Example now has a complete reading frame |
| 4 | **Sub-path hosting broken**: prerendered links ignored `BASE_PATH`, and product screenshots used root paths | all pages on `github.io/<repo>/` | Server render uses the base; screenshots use the base-aware helper |
| 5 | **Colour contrast below WCAG AA on ~130 pages** (teal buttons 3.99:1, grey helper text 3.1:1, kickers) | site-wide | Teal darkened to #0c7d70, faint grey to #646e8a |
| 6 | Dark mode: white text on bright accent buttons (1.9:1), faint counters, status labels | dark theme | Dark text on accent fills; brighter greys/greens |
| 7 | Homepage product tabs: invalid ARIA (tabs not inside a tablist, no tabpanel, no arrow keys) | `/` | Proper tab pattern with keyboard support |
| 8 | 16 scrollable tables not reachable by keyboard | fees, programmes, internships, research, docs, Workbench | Focusable labelled regions |
| 9 | Workbench links without trailing slash → extra 301 redirect on every click | Workbench | Use the site's slash-adding link component |
| 10 | Course finder placeholder links had no `href` (Lighthouse SEO 92) | `/vedicgen/courses/` | Rendered as text |
| 11 | Every page downloaded the full 300 KB course catalogue at idle | all pages | Loaded on first interaction only |
| 12 | 71 meta descriptions longer than ~160 characters (cut off mid-sentence in Google) | site-wide | Trimmed at a sentence/word boundary |
| 13 | Unit test could randomly fail on slower CI machines (5 s default timeout for a 25 s budget) and **block deployment** | CI | Realistic timeouts |
| 14 | Application success message promised "a confirmation is on its way" (free Formspree sends none) | forms | Honest wording |
| 15 | Smaller items: over-long Workbench title, Mol* logo link without a name, link not distinguishable from text, figure with focusable content inside `aria-hidden`, small "Register" tap target | various | Fixed |
| 16 | No security policy (GitHub Pages cannot send headers) | all pages | Content-Security-Policy + referrer policy meta tags (studios verified working under it) |

## Final results
* 597 page views: **0** JS errors, **0** console errors, **0** failed requests, **0** broken images, **0** layout overflow, **0** broken internal links or anchors, **0** redirects in internal links.
* axe-core: **0** violations on every page in light mode (re-run) and on the dark-mode sample.
* Lighthouse mobile (gzip): Performance **82–96**, Accessibility **100**, Best Practices **100**, SEO **100** (8 pages).
* External links: 53/54 return 200; `doi.org` returns 403 to automated requests only (the link is valid in a browser).

## Remaining issues (honest)
1. **Forms are not delivered to an inbox until a free Formspree/Web3Forms key is added.** Until then they open the visitor's e-mail app; a visitor with no mail app configured (common on office PCs) must copy the address shown.
2. **Owner facts missing**: team/instructor profiles, phone/WhatsApp, social links, cohort dates, payment links, legal entity name. The site hides these gracefully, but the lack of named people and real testimonials weakens trust and SEO (E-E-A-T).
3. **Payments**: there is no checkout by design; add Razorpay/Cashfree payment links per cohort.
4. **Security headers**: GitHub Pages cannot send HSTS, X-Frame-Options or `frame-ancestors`; the CSP meta needs `'unsafe-inline'` for the theme script. Low risk for a static site. Moving to Cloudflare Pages (free) would apply the existing `_headers` file.
5. **Performance on slow phones**: first paint ≈2–3 s and LCP ≈3–4 s on simulated slow 4G (the stylesheet is 159 KB before compression, the entry script ~390 KB raw). Acceptable; could be improved by splitting the CSS per section.
6. Inline text links and form checkboxes are 18–20 px tall on phones (allowed by WCAG for inline links; the checkbox's label is also clickable).
7. Legal pages (privacy, terms, refunds) need a lawyer's review; business policies (refund rule, group discount, instalments) need the owner's confirmation.
8. The site has not yet been deployed (no GitHub repository exists yet), so DNS/HTTPS on vivofold.in is untested.
