# Vivofold SEO strategy

Updated October 2026: research and decisions are in `docs/SEO-RESEARCH-2026.md`; the owner's account tasks (Search Console, Bing, IndexNow, directories) are in `docs/SEO-OWNER-CHECKLIST.md`. Where this older document disagrees (for example about FAQ rich results, which Google retired in May 2026), the research document wins.

## What to expect, honestly
No one can guarantee a #1 Google position, and anyone who promises one is not being straight with you. What this site does
is remove every technical obstacle and give Google well-structured, specific, original pages. Realistic timeline after launch
and Search Console verification:

* **Brand searches** ("Vivofold", "Vedicgen", "Nayancode", "Vivofold Vedicgen courses"): usually indexed and ranking at or
  near the top within **days to a few weeks**, because the names are distinctive and the site is the only authority on them.
* **Specific long-tail searches** ("RNA-seq data analysis course fees India", "qPCR ΔΔCt worked example", "AutoDock Vina
  tutorial redocking"): **1–4 months**, faster with the knowledge-hub guides and free tools linking to course pages.
* **Broad competitive searches** ("bioinformatics course", "biotech internship"): **6–12+ months**, and they depend mostly on
  off-site signals the website cannot create alone: backlinks from universities and journals, reviews, citations, social
  mentions and consistent publishing.

## Keyword map (one primary intent per page; no two pages compete)

| Page | Primary keywords | Supporting keywords |
|---|---|---|
| `/` | Vivofold, biotechnology and bioinformatics company | wet-lab and dry-lab training, bioinformatics software, research services |
| `/vedicgen/` | bioinformatics courses India, biotechnology courses | wet-lab training, dry-lab courses, Vedicgen |
| `/vedicgen/courses/` | bioinformatics courses with fees, biotech courses online | NGS course, RNA-seq course, molecular docking course, Python for biology |
| `/vedicgen/courses/<slug>/` (73) | the course name + "course" (e.g. "RNA-seq data analysis course") | syllabus, fees, certificate, eligibility, the tools taught |
| `/vedicgen/programs/<slug>/` (9) | "professional certificate in …" | career outcome, months, capstone |
| `/vedicgen/internships/` and `/<slug>/` (12) | bioinformatics internship, biotechnology internship, wet-lab internship | dissertation project, summer internship, M.Sc. project |
| `/vedicgen/workshops/` | bioinformatics workshop, hands-on PCR workshop | online workshop, weekend workshop |
| `/vedicgen/institutions/` | bioinformatics training for colleges, FDP bioinformatics | value-added course, campus workshop |
| `/vedicgen/pricing/` | bioinformatics course fees | internship fees, instalments, GST |
| `/nayancode/` and products | online bioinformatics software, browser bioinformatics tools | RNA-seq analysis online, docking viewer, single-cell analysis online |
| `/nayancode/tools/<slug>/` (11) | "GC content calculator", "reverse complement tool", "primer Tm calculator"… | free, online, no upload |
| `/services/` and `/services/<slug>/` (19) | bioinformatics services, RNA-seq analysis service, NGS data analysis service | Bio-IT, cloud pipelines, docking service |
| `/research/<slug>/` (7) | the research area + "research" | open projects, collaboration |
| `/learn/<slug>/` (16) | how-to and explainer queries ("how to calculate ΔΔCt", "pLDDT and PAE explained") | link to the matching course and tool |

## Technical SEO already in place
* Every public URL is **prerendered to static HTML** (199 pages) with a unique `<title>` and meta description (tested), a
  canonical URL, Open Graph and Twitter cards with per-brand share images, `lang="en-IN"`, and semantic headings (one `h1`).
* **Trailing-slash URLs** that match GitHub Pages exactly (`/path/` serves `path/index.html`; `/path` 301-redirects), so
  canonical, sitemap and served URL are identical. 91 old URLs have redirect pages (meta refresh + canonical, `noindex`).
* `sitemap.xml` (186 URLs with priorities and last-modified dates), `robots.txt` (blocks only app-internal routes), a real
  `404.html` with HTTP 404 status.
* **Structured data (JSON-LD)**: Organization + LocalBusiness with Vedicgen (EducationalOrganization) and Nayancode as
  departments; Course with INR and USD Offers and CourseInstance; EducationalOccupationalProgram for programmes and
  internships; Service; SoftwareApplication; ResearchProject; TechArticle; FAQPage; BreadcrumbList; ItemList; HowTo.
* Internal linking: every course links to its programmes, tools, related guides and software; every guide links back to a
  course and a tool; breadcrumbs on every page; mega-menus and footer give every section a crawlable link.
* Performance: entry JavaScript ~115 KB gzipped, page chunks loaded on demand, fonts self-hosted and preloaded, images in
  WebP with width/height (no layout shift), animations respect `prefers-reduced-motion`.
* Accessibility (also a ranking input): labelled forms, keyboard-operable tabs and menus, skip link, alt text, contrast checked.

## Launch steps (do these in order)
1. Deploy to `https://vivofold.in` (see `README.md`).
2. **Google Search Console**: add a *Domain* property for `vivofold.in` and verify it with the DNS TXT record (recommended), or
   use the HTML-tag method by setting the `VITE_GOOGLE_SITE_VERIFICATION` repository variable and redeploying.
3. Submit `https://vivofold.in/sitemap.xml` in Search Console → Sitemaps. Use *URL inspection → Request indexing* for `/`,
   `/vedicgen/`, `/vedicgen/courses/`, `/nayancode/` and `/services/`.
4. **Bing Webmaster Tools**: import the site from Search Console (one click); this also feeds DuckDuckGo and others.
5. **Google Business Profile** for Vivofold at the HSR Layout address, with the website link, categories ("Educational
   institution", "Software company", "Research institute"), hours, photos of the office/lab. This is the biggest single win
   for local searches.
6. Make the name, address and e-mail identical everywhere (site, Business Profile, LinkedIn, directories).

## Content plan (first 6 months)
* Publish **two knowledge-hub guides a month** (`src/site/articles/*.md` + an entry in `src/site/data/articles.ts`). Suggested
  next topics: "How to choose an M.Sc. bioinformatics dissertation project", "Western blot troubleshooting", "scRNA-seq QC
  thresholds explained", "Nextflow vs Snakemake", "Interpreting a VCF file", "What is QSAR applicability domain",
  "Bioinformatics career paths in India", "Primer design rules with worked examples".
* Add real **instructor profiles** (`TEAM` in `src/core/brand.ts`) and cohort dates (`BATCHES`): named experts and real dates
  improve trust signals and enable Google's course-listing rich results.
* After the first cohorts, publish **real testimonials and project showcases** (never invented ones).
* Earn **backlinks**: offer free workshops to university departments (they link to event pages), list the free tools on
  bioinformatics resource lists, post guides on LinkedIn and ResearchGate with a link back, and get listed in
  education/training directories.

## Monitoring
Check Search Console weekly for the first two months: Coverage/Pages (indexing errors), Performance (queries, CTR), Core Web
Vitals and Enhancements (Course, FAQ, Breadcrumb rich results). Rewrite titles/descriptions of pages with high impressions
but low click-through.
