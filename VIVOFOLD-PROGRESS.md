# Vivofold website: session progress and handoff (updated 2026-10-15)

Read this first when resuming. It records what was built in the "Vivofold / Vedicgen / Nayancode" session, the
decisions and user preferences, and exactly what remains.

## User requirements and preferences (do not violate)
- **Vivofold is the company and primary brand everywhere.** Vedicgen = Vivofold's *school* (education sub-brand),
  Nayancode = Vivofold's *software* sub-brand. Always shown under the Vivofold logo ("Vivofold Vedicgen", "Vivofold Nayancode"), never as separate companies.
- **Official logo** supplied by the user (ribbon "V" with DNA leaf, blue→violet→teal). Vectorised to `public/brand/vivofold-mark.svg` (also `public/favicon.svg`). Wordmark "VIVOFOLD" rebuilt from Montserrat SemiBold outlines in `src/site/wordmark.ts` (fill = currentColor). Original raster kept at `public/brand/vivofold-logo-original.webp`.
- **"Bengaluru" must not appear anywhere except the postal address** (footer, contact page address block, structured-data address). Use "in our laboratory" / "in person" instead.
- **Address block only at the very end** (footer; contact page bottom). No "Find us" section mid-page on the homepage.
- **No scrolling tool-name marquee.** Replaced with a "Who we work with" sectors band on the homepage.
- Site must look premium and professional. 2026-10-15: the owner rejected the gradient/pill/glow "vibe-coded" look; keep the restrained identity in `refine.css` with purposeful, quiet animation only.
- Official contacts: contact@vivofold.in (general), help@vivofold.in (admissions/help), support@vivofold.in (software support). Address: Vivofold, 2nd Floor, No. 754, 19th Main Rd, 22nd Cross Rd, Sector 2, HSR Layout, Bengaluru, Karnataka 560102, India. Domain https://vivofold.in. Hosting: **GitHub Pages**.
- Never invent competitor prices, partners, testimonials, publications or credentials. Owner/founder details and final logo stay editable (`src/core/brand.ts` → `TEAM`, `BRAND.legalName`, `BRAND.phone`, `BRAND.socials`).
- Do not write course content on protein design or immunoinformatics/vaccine design (a safety classifier stopped those outputs twice).
- User wants the whole thing finished without being asked questions; keep a live preview running (dev server on :5173 via preview `workbench-dev`).

## Brand system (implemented)
- Palette from the logo: navy ink `#0b1736`, royal blue `#1f5fd6`, violet `#6a55d4`, teal `#0f8f80`; gradient `--grad` (blue→violet→teal).
  Sub-brand accents: Vedicgen = teal, Nayancode = violet, Vivofold = blue (`.site[data-div=…]` sets `--accent`).
- Type: Plus Jakarta Sans Variable (headings/UI; narrow word space fixed with `word-spacing: .075em`), IBM Plex Sans (text), IBM Plex Mono (code). Source Serif was tried and removed.
- Taglines: Vivofold "Biology, unfolded."; Vedicgen "From pipette to pipeline."; Nayancode "See the biology in your data."
  Hero line: "Where wet-lab craft meets computational power. Vivofold trains the next generation of scientists through Vedicgen, builds research-grade software through Nayancode, and turns complex biological data into clear answers for laboratories worldwide."
- Styles: `src/site/site.css` (older base) + **`src/site/vivofold.css`** (new design system, loaded after; most new components live here).
- Signature hero animation `src/site/FoldField.tsx` (canvas strand folding helix↔fold, pointer-reactive, reduced-motion safe). Card pointer spotlight via `--mx/--my` set in `SiteLayout.tsx`.

## Architecture (implemented)
- React 19 + Vite 8 SPA, every public route **prerendered** to `route/index.html` (`scripts/prerender.mjs`), hydrated on load. Trailing-slash URLs everywhere (`src/site/Link.tsx` wrapper adds the slash; canonicals/sitemap use it). GitHub Pages friendly.
- `public/CNAME` (vivofold.in), `public/.nojekyll`, `public/site.webmanifest`, `scripts/serve.mjs` emulates GitHub Pages (folder → 301 to slash; 404.html with status 404).
- `.github/workflows/deploy.yml`: test, build, e2e, deploy to Pages. Repo variables: `VITE_FORM_ENDPOINT`, `VITE_FORM_ACCESS_KEY`, `VITE_GOOGLE_SITE_VERIFICATION`, `BASE_PATH`.
- Forms (`src/site/Form.tsx`): Formspree/Web3Forms via `INTEGRATIONS.formEndpoint` or `VITE_FORM_ENDPOINT`; otherwise mailto to the right inbox. `ApplicationForm` (sections, consent, SOP min length, next steps). Inbox routing: help (Vedicgen), support (Nayancode), general.
- SEO (`src/site/seo.ts`): unique titles/descriptions, canonical, OG per sub-brand (`/og.png`, `/og-vedicgen.png`, `/og-nayancode.png`), JSON-LD (Organization+LocalBusiness with departments, EducationalOrganization, Course with offers & CourseInstance, EducationalOccupationalProgram, Service, SoftwareApplication, ResearchProject, FAQPage, BreadcrumbList, TechArticle, ItemList, HowTo), `legacyRedirects()` for old URLs. `scripts/og.mjs` generates OG + logo PNGs (`public/brand/vivofold-logo-512/192.png`, `apple-touch-icon.png`, `favicon-32.png`).
- Product screenshots: `scripts/screens.mjs` captures real screenshots of every Nayancode product from the running app → `public/img/products/*.webp` (done, 13 images).
- Workbench shell (`src/ui/Shell.tsx`) shows Vivofold mark + "Nayancode Workbench".

## Routes (all implemented, no placeholders)
Vivofold: `/`, `/about`, `/contact`, `/research`, `/research/:slug` (7), `/services`, `/services/:slug` (19), `/learn`, `/learn/:slug` (16), `/verify`, `/privacy`, `/terms`, `/refund-policy`.
Vedicgen: `/vedicgen`, `/vedicgen/courses` (filters, finder), `/vedicgen/courses/:slug` (73), `/vedicgen/programs`, `/vedicgen/programs/:slug` (9), `/vedicgen/internships`, `/vedicgen/internships/:slug` (12), `/vedicgen/workshops`, `/vedicgen/research-training`, `/vedicgen/institutions`, `/vedicgen/pricing`, `/vedicgen/apply`.
Nayancode: `/nayancode`, `/nayancode/products`, `/nayancode/products/:slug` (13), `/nayancode/tools`, `/nayancode/tools/:slug` (11), `/nayancode/docs`, `/nayancode/pricing`, `/nayancode/demo`.
App: `/workbench`, studios (`/sequence`, `/genome`, …), `/atlas`, `/report`, `/import`, `/licenses`.
Last successful build: 199 pages + 91 redirects, sitemap 186 URLs.

## Data (src/site/data)
- `course-types.ts` (types, fee tiers, FAQ constants, eligibility, **now also SCHOOLS, schoolOf, CATEGORIES, LEVELS, DISCIPLINE_LABEL, inr, withGst, durationOf, LiteCourse type**).
- Courses (73): `courses-bioinfo.ts` (12 original), `courses-bioinfo2.ts` (15), `courses-bioinfo3.ts` (4), `courses-computing.ts` (21), `courses-biotech.ts` (14 wet-lab/hybrid), `courses-life.ts` (7).
- Fees (INR + 18% GST, raised ~20% on 2026-10-14 for negotiation headroom): dry tiers self-paced 3,499/4,499/5,999, live 8,499/10,999/12,499; USD 59/79/99 and 149/189/219; wet-lab per course (7,499–32,999); life sciences 4,999 live / 2,499 self-paced. Programmes 23,999–49,999.
- Durations (2026-10-14): every course is at most 4 weeks (`MAX_WEEKS` in course-types.ts, enforced in `normalise`), dry live courses 4 weeks / 32 h; durations and programme pace are customisable (`SCHEDULES`, `FLEX_NOTE`, `PROGRAM_FLEX_NOTE`, FAQ `FLEX`; schedule select on every course/programme application form). Internships dry 6,999/12,999/17,999/32,999 (4/8/12/24 wk), wet 14,999/24,999/34,999/59,999, hybrid 22,999/29,999/49,999; Nayancode SWE internship no fee. Workshops 999–3,999. Research-training and institutional rates in `training.ts`. Policies: instalments >₹15k, 10% group discount (5+), refund policy page.
- `internships.ts` (12 tracks + INTERN_PROCESS), `training.ts` (14 workshops, 4 research training, 5 institutional), `services.ts` (19, with `status` available/on-request/planned and wet-lab ones planned), `products.ts` (13 + ROADMAP + LICENSING), `research.ts` (7 areas), `articles.ts` (16; 8 new articles in `src/site/articles/*.md`), `faq.ts`, `tools.ts`.
- Market research sources (verified on provider pages, Oct 2026): iLearn CRI 3-month bioinformatics ₹40,000+GST; IIT Hyderabad CCE ML in Bioinformatics ₹10,000+GST; BDG LifeSciences docking 10-day ₹8,999, Python for Genomics ₹3,199; RGCB 6-month certificate ₹35,000/₹70,000; Physalia RNA-seq beginners €480, single-cell €530; Allele Life Sciences qPCR 12 h ₹5,000; IISER Pune qPCR 1-day ₹2,596 incl. GST; Biotecnika animal cell culture 3-day ₹6,899–8,099; Biotecnika CRISPR 15+15 days ₹42,199; Biotecnika bioinformatics internship online 30d ₹8,899 / 3m ₹24,099 / 6m ₹45,799, offline 3m ₹53,999 / 6m ₹92,099. (C-CAMP 4-day ₹20,000 incl GST, 2023, search-reported only.) → still to be written up in `docs/PRICING-RESEARCH.md`.

## Completed (2026-10-14, final session)
- Bundle-size refactor done: generated lite index `src/site/data/site-index.json` (built by `scripts/site-index.mjs` from `index-source.ts`; regenerated by `dev`/`build` and a Vite plugin), typed in `lite.ts`; listing pages use lite data, detail pages and `seo.ts` use full data. Entry ≈115 KB gzip; full course data (≈92 KB gzip) loads only on course pages.
- Tests: `npm test` 198/198; `npm run e2e` 25/25 (12 site + 13 studios), also green with `GH_PAGES=1 E2E_PORT=4182` (serve.mjs ignores `_headers`, i.e. exact GitHub Pages behaviour; CI runs e2e this way).
- Visual QA desktop 1440 / mobile 390, light + dark. Fixed: mobile hero "Biology,unfolded." missing space (space moved outside inline-block span); `.ptabs` tab strips scroll horizontally on phones; hard-coded light gradients (`.dcard--vg/--vf`, `.dhero--vg`, `.shot-frame--light`) replaced with `color-mix(... var(--paper))` so dark mode keeps contrast.
- New wet-lab SVG figures in `src/site/figures.tsx`: `gel`, `qpcr`, `plate` (ELISA), `growth`, `chromatogram` (deterministic, arithmetic only); assigned to wet-lab courses, wet internships, wet services and the wet-lab research area.
- Docs: new `README.md` (deploy to GitHub Pages, DNS for vivofold.in, Formspree, editing guide), `docs/PRICING-RESEARCH.md` (all sources with URLs), `docs/SEO-STRATEGY.md`, `docs/LAUNCH-CHECKLIST.md`. Old `AUDIT-TASKS.md` and `PLAN.md` moved to `docs/history/`.

## QA audit (2026-10-14, later session)
Full report: `docs/QA-REPORT.md`. Courses capped at 4 weeks + customisable schedules; course/programme fees +~20%.
Fixed: header blur dropped by CSS minifier (now on `.hdr::before`; never put backdrop-filter on `.hdr` itself, it traps the
fixed mobile menu), 404 hydration error (404.html now client-renders), ORF example, BASE_PATH sub-path (StaticRouter basename,
`asset()` for screenshots), WCAG contrast (teal #0c7d70, ink-4 #646e8a; dark-mode accent text dark), tablist ARIA, focusable
table regions, CSP + referrer meta in index.html, seo.ts no longer preloaded at idle, description clipping (`clip()` in seo.ts),
CI test timeouts. Tests: 198 unit, 29 e2e. QA scripts (crawler, axe, Lighthouse) were run from a scratch folder, not committed.

## Repositioning and redesign (2026-10-15)
Owner direction: Vivofold is a computational biotech/bioinformatics company (AI + physics drug discovery, de novo design,
multi-omics/spatial, target discovery, AI platform for biopharma, novel biologics) plus partner solutions (contract AI
discovery, CADD/QSAR, NGS pipelines, clinical variant interpretation, PGx, biomarker strategy, genomic surveillance, cloud,
bio-IT, bioprocess, hybrid CRO/CDMO). Vedicgen and Nayancode are small but reachable parts. The owner disliked the
"vibe-coded" look and the "Available now / In development" tags: both are gone from company pages.
- New pages: `/science/`, `/solutions/`, `/industry/` (`src/site/pages/Science.tsx`, data `src/site/data/focus.ts`,
  visuals `src/site/Visuals.tsx`, styles `science.css`). Market sources: `docs/MARKET-RESEARCH.md`.
- Identity: `src/site/refine.css` (loaded last) replaces the template look: IBM Plex Sans only (Plus Jakarta removed),
  warm paper + ink, one blue, square controls, hairlines instead of shadows, no gradient text/buttons, no hover lifts.
- Home rewritten (editorial lists, no stats counters, no course promotion). Nav: Science, Solutions, Services, Research,
  Vedicgen, Nayancode, About; header CTA "Partner with us".
- Offices: `BRAND.locations` (Chennai, street address pending). Forms: FormSubmit by default (no account; one activation
  click per inbox), e-mail fallback on failure; `VITE_FORM_PROVIDER=mailto` disables.
- Content caution: keep de novo protein design and novel-biologics copy at one-sentence positioning level (a safety
  filter stopped detailed drafts several times).

## Nayancode Workbench: open source, DOI, benchmarks, security (2026-10-15)
**Two repositories.** `../nayancode` (= github.com/balajimadhvn/nayancode, Apache-2.0) is the **source of truth** for the
Workbench; this website repo gets it by `node scripts/sync-workbench.mjs` (copies src/studios, ui, pages, compute, viz,
styles, core except brand.ts, public/wasm|rdkit|data, benchmarks). After syncing, stage only those Workbench paths (not
`git add -A`), `git pull --rebase`, push. Both repos deploy to GitHub Pages on every push to main (tests, build, e2e).
Live: https://balajimadhvn.github.io/nayancode/ and https://vivofold.in/.
**Commit identity** (no global git identity on this machine): `git -c user.name=balajimadhvn -c user.email=maivannanrangan@gmail.com commit`.
**Memory/notes:** `~/.claude/projects/-run-media-aji-1-TB-company-webpage/memory/` (see `nayancode-publication.md`).

**Publication identifiers (done).** Author: Balaji Madhavan, ORCID 0009-0007-8654-3864, "Vivofold, India".
Zenodo concept DOI **10.5281/zenodo.23393495** (v1.0.0 = 10.5281/zenodo.23393496); the Zenodo webhook is on, so every GitHub
release mints a new version DOI. Software Heritage snapshot `swh:1:snp:67315dfae82fc87ef6305b079143593ebb115e45`.
`CITATION.cff`, `.zenodo.json`, README badge and the Workbench's auto-written Methods all cite the DOI.

**Engine work (done).** Expression Studio fits any design (TMM, voom, moderated t/F; sample-sheet design table, contrasts,
F-test, numeric trends, paired samples; `src/studios/expression/{linear,design}.ts`). Matches limma-voom exactly after two
fixes found by benchmarking (adaptive voom span; limma-style `fitFDist` prior). Single-Cell HVG/normalisation/PCA fixed to
match Scanpy. New browser-side heavy tools: bcftools SNV+indel calling (WebAssembly), ML tree bootstrap in parallel workers;
the "Needs a server later" card was removed. Downloads are named `vivofold-nayancode_<name>_<date>.<ext>`
(`src/core/filename.ts`). Works over plain http (`src/core/id.ts`, `clipboard.ts` fallbacks). No inline scripts
(`public/theme-init.js`), CSP without `unsafe-inline`, `public/.well-known/security.txt`, footer cookie-policy link.

**Benchmarks (done, in CI).** `nayancode/benchmarks/` (`npm run bench`, results in `benchmarks/RESULTS.md`). Data fetched by
`benchmarks/fetch.sh` with SHA-256 checks. Expression vs DESeq2/limma-voom/edgeR on airway + pasilla (identical to
limma-voom; r 0.99+ with DESeq2/edgeR). Single-Cell vs Scanpy on PBMC3k (same cells, 1,996/2,000 shared HVGs, PC1-7 match,
cluster ARI 0.75). Reference tools run only on this machine/CI, never shipped (GPL-safe). R refs: conda env `rna-seq`
(`/home/aji/anaconda3/envs/rna-seq/bin/Rscript`). Scanpy: a venv built from Python 3.12 (`unidock` env python); Python 3.14
has no wheels.

**In progress (a separate Claude session, "Benchmarks ... browser heavy tools"):** bcftools-CLI benchmark (E. coli REL606 +
SRR2584863 reads), IQ-TREE benchmark, three case studies (airway, PBMC3k, bacterial variants or a phylogeny) in
`nayancode/docs/case-studies/`. Check `git log` in `../nayancode` and `benchmarks/RESULTS.md` for what has landed.

**Usability study (kit done, study needs people).** `nayancode/docs/usability/`: PROTOCOL, CONSENT, TASKS (+ answer key),
SUS, results-template.csv; `scripts/usability-materials.mjs` and `scripts/usability-analyse.mjs`. Needs ethics approval or a
written exemption first (fill the reference into PROTOCOL/CONSENT), 12-20 students + 5-10 outside researchers.

**Paper status (honest).** Software is citable now. A journal paper (NAR Web Server issue first choice; else Bioinformatics
Application Note; JOSS for the library) still needs: bcftools + IQ-TREE comparisons, case studies, usability results,
author list/affiliations confirmed, bioRxiv preprint, bio.tools + RRID entries. Plan: `docs/PUBLICATION-PLAN.md`.
Tool roadmap (free-hosting-only): `nayancode/docs/ROADMAP.md`.

**HTTPS on vivofold.in (open).** DNS is right (4 GitHub A records, www CNAME) but GitHub's certificate was stuck at
"authorization_created"; the custom domain was removed and re-added on 2026-10-15 and a watcher was set to enforce HTTPS
when issued. Check: `gh api repos/balajimadhvn/vivofold-website/pages -q '.https_certificate.state'`; when `approved`:
`gh api -X PUT repos/balajimadhvn/vivofold-website/pages -F https_enforced=true`. If still stuck after a day, contact GitHub
Support or move to Cloudflare Pages (free; reads `public/_headers`, which already holds frame-ancestors, HSTS, nosniff).
robustdevs.co scan findings that GitHub Pages cannot fix: X-Content-Type-Options / X-Frame-Options headers and
`Access-Control-Allow-Origin: *` (harmless for a public static site). **DMARC** needs a TXT record at Namecheap (owner):
`_dmarc` = `v=DMARC1; p=reject; adkim=s; aspf=s` if nothing is ever sent *from* @vivofold.in, else `p=none; rua=mailto:support@vivofold.in`.

**Hosting rule (owner, firm):** everything must be hostable free (GitHub Pages, or Cloudflare Pages if needed); heavy tools
are fine if they run client-side. Current build 21 MB, largest file 7.3 MB (limits 1 GB site / 100 MB file / ~100 GB/month).
Multi-threaded WebAssembly needs cross-origin isolation, which GitHub Pages cannot send (use `coi-serviceworker` there or
Cloudflare Pages `_headers`).

## Cloudflare move (2026-10-15 evening) — STATE AND NEXT STEPS
- Account: Cloudflare (balajimadhvn@gmail.com), account id 6211801e8c89119bfbe6981f22954940. Zone vivofold.in is ACTIVE (Free).
  Namecheap nameservers = alberto.ns.cloudflare.com, karina.ns.cloudflare.com (registry confirmed). Namecheap email
  forwarders were deleted by the owner; Cloudflare Email Routing forwards contact@/help@/support@/balajimadhvn@ to
  balajimadhvn@gmail.com (destination verified).
- DNS at Cloudflare: 4 A records 185.199.108-111.153 (GitHub Pages) **proxied**, www CNAME balajimadhvn.github.io
  (still DNS-only; switch to proxied), MX route1/2/3.mx.cloudflare.net, SPF include:_spf.mx.cloudflare.net, DKIM
  cf2024-1._domainkey, DMARC p=reject, google-site-verification TXT. So right now Cloudflare proxies GitHub Pages:
  https comes from Cloudflare's Universal SSL automatically once issued.
- Workers project `vivofold-website` (Git-connected to balajimadhvn/vivofold-website, build `npm run build`, deploy
  `npx wrangler deploy`, config `wrangler.jsonc`) builds green; live at https://vivofold-website.balajimadhvn.workers.dev
  with all security headers from public/_headers.
- NEXT: (1) Worker → Settings → Domains & Routes → add custom domains vivofold.in and www.vivofold.in (first delete
  the 4 A records and the www CNAME, they conflict). (2) SSL/TLS → Edge Certificates → Always Use HTTPS on.
  (3) Email Routing overview should show DNS "configured"; send a test mail. (4) Remove the custom domain from
  GitHub Pages (`gh api -X PUT repos/balajimadhvn/vivofold-website/pages -F cname=null`) and consider disabling the
  GitHub Pages deploy job in this repo. (5) Search Console: submit https://vivofold.in/sitemap.xml, request indexing.
- Tool sessions (worktrees under ../nayancode/.claude/worktrees/): docking-studio, genome-tools, lab-and-figures (2nd
  attempt); each opens a PR on balajimadhvn/nayancode — review, merge, then sync the site. Benchmarks session on
  nayancode main: IQ-TREE + bcftools + case studies, may still be uncommitted.

## Still needs the owner (cannot be done in code)
Also (2026-10-15): DMARC TXT record at Namecheap; ethics approval + participants for the usability study; confirm author list/affiliations
and the target journal; decide on Cloudflare Pages if GitHub's certificate stays stuck; Cloudflare Web Analytics token (optional).
Legal entity name, phone/WhatsApp, socials, TEAM/instructor profiles, Formspree endpoint (`VITE_FORM_ENDPOINT`), Search Console verification, cohort dates + payment links (`BATCHES`), review of fees/instalments/10% group discount/7-day refund rule/free Nayancode internship, confirmation that the wet-lab training venue is ready, lawyer review of legal pages. See `docs/LAUNCH-CHECKLIST.md`.
