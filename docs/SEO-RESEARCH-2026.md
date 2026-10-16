# SEO research, October 2026

Findings behind the SEO changes on this branch. Every claim below was checked against the linked page on 2026-10-16.

## Why the site is not showing up yet

* **It is new.** vivofold.in only moved to Cloudflare with working https on 2026-10-15. A `site:vivofold.in` check returns nothing, which means Google has probably indexed few or no pages. No amount of on-page work shows up until Google has crawled the site, and Google only learns about a new domain quickly if it is told: Search Console + sitemap + backlinks. That is owner work (see the checklist in the PR).
* **The old home title did not mention training at all.** "Vivofold: AI Drug Discovery, Multi-Omics & Biologic Design" matches nobody searching for courses. Course and internship pages had good titles, but nothing on the home or hub pages tied the brand to those words.
* **Broad queries are won by established sites.** Results for "bioinformatics course India", "bioinformatics internship for students India", "molecular docking course online certificate" and "RNA-seq data analysis course online" are dominated by institute and university pages (CSIR-IICB, RGCB, Ashoka, AIIMS, DBT BIITP), by aggregators (Biotecnika, Henry Harvin, Nanoschool) and by named training companies (Physalia, Sequentia, BDG LifeSciences). A new domain will not outrank them for the two-word head terms in months; the realistic target is long-tail pages that state level, mode, duration, certificate and tools, and brand queries.

## What ranks today (search intent and page features)

| Query | Intent | What the top pages have |
|---|---|---|
| bioinformatics course India online certificate | Commercial: compare programmes, fees, duration, certificate | Duration, mode (online/offline), eligibility, fee, certificate type, syllabus on one page; institute PDFs and listicles |
| bioinformatics internship for students India | Find an open, ideally paid, placement; duration, eligibility, how to apply | Eligibility, stipend, dates, application route; many are time-bound notices |
| molecular docking / CADD course | Tool-specific skills: AutoDock Vina, PyMOL, GROMACS, Schrödinger | Named tools, number of days/sessions, fee, certificate type, recording |
| RNA-seq data analysis course | Skills course: DESeq2, Galaxy, R/Bioconductor | Day-by-day syllabus, prerequisites (Linux, R), format, hours, dates |

Sources: [Henry Harvin guide](https://www.henryharvin.com/blog/top-bioinformatics-courses-in-bangalore/), [CSIR-IICB course PDF](https://iicb.res.in/storage/sdp/2026-27/Session1/BIO.pdf), [AIIMS Delhi internship notice](https://www.biotecnika.org/2026/01/aiims-delhi-bioinformatics-internship-applications-invited), [DST BIITP](https://www.indiascienceandtechnology.gov.in/nurturing-minds/scholarships/graduation-post-graduation/bioinformatics-industrial-training-programme-biitp), [BDG LifeSciences docking workshop](https://konfhub.com/molecular-docking-training), [Sequentia RNA-seq course](https://www.sequentiabiotech.com/?p=13750), [Nanoschool RNA-seq](https://nanoschool.in/course/introduction-to-rna-seq-analysis-2/).

What this means for the pages: put level, mode, duration, tools taught, fee and certificate type in the title/description/first paragraph, keep the syllabus visible, state eligibility. Vedicgen course pages already carry these; the work was in titles, hubs and descriptions.

## Google documentation checked

* **Course structured data** ([docs](https://developers.google.com/search/docs/appearance/structured-data/course)): required `name` and `description` (displayed to 60 characters), recommended `provider`. A course list needs `ItemList` markup (position + unique canonical url per item) on a summary page, and at least three courses must be marked up. Course names must not contain promotional wording, prices, discounts or calls to action. Only real courses (structured lessons, instructor-led, explicit outcomes); events and single videos do not qualify. Vedicgen courses qualify. `offers`, `hasCourseInstance` (`courseMode`, `courseWorkload`) are valid schema.org and useful to Bing and AI answers even where Google does not show them.
* **EducationalOccupationalProgram**: valid schema.org for programmes; Google has no dedicated rich result for it, so it is for machine understanding, not a feature we can count on.
* **JobPosting** ([policy](https://developers.google.com/search/docs/appearance/structured-data/job-posting)): "We don't allow job postings that require payment from applicants." Vedicgen internships charge a fee and are training programmes, not jobs, so **no JobPosting markup is added**. Internships are marked up as `EducationalOccupationalProgram` (programType Internship). This is also the honest description.
* **FAQPage** ([docs](https://developers.google.com/search/docs/appearance/structured-data/faqpage)): Google stopped showing FAQ rich results on 2026-05-07 and removed the documentation. The FAQ markup stays (valid, harmless, still read by other engines) but no ranking benefit is assumed from it; the FAQs are kept as visible on-page content, which is what helps.
* **Organization / logo** ([docs](https://developers.google.com/search/docs/appearance/structured-data/organization)): logo at least 112×112 px, crawlable, readable on white; `sameAs` should list real profile pages. The logo is a 512×512 PNG; `sameAs` is emitted only from `BRAND.socials`, which is empty because no profile has been confirmed. Fill it in once a LinkedIn page and others exist.
* **Favicon** ([docs](https://developers.google.com/search/docs/appearance/favicon-in-search)): square, multiples of 48 px recommended, one per hostname, home page must be crawlable, `rel=icon` in the home page head, may take days to weeks to appear. Already fixed by the parent session; nothing here changes the favicon files.
* **Title links** ([docs](https://developers.google.com/search/docs/appearance/title-link)): descriptive and concise, distinct per page, brief brand at the start or end, no keyword repetition, make the `<h1>` match. Google rewrites titles that are boilerplate or mismatched.
* **Sitelinks** ([docs](https://developers.google.com/search/docs/appearance/sitelinks)): automatic; helped by clear titles, a logical structure and short anchor text on internal links. Not controllable.
* **Helpful content / E-E-A-T** ([docs](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)): original, people-first content; show who is behind it and how it was made; no inflated word counts or fake freshness. Hence: no invented reviews, ratings or placements, and `lastmod` in the sitemap now reflects the real last change instead of the build day.

## Bing and IndexNow

* [IndexNow](https://www.indexnow.org/documentation): a key of 8–128 characters (a–z, A–Z, 0–9, dash) hosted as `/<key>.txt` containing the key, then a GET or a JSON POST (up to 10,000 URLs) to a participating engine's `/indexnow`. Participating engines share submissions. Bing uses it; Google does not. The key file is committed in `public/` and `scripts/indexnow.mjs` submits the sitemap's URLs after a deploy.
* Bing Webmaster Tools can import the verified site from Search Console (owner action).

## Decisions

* No location landing pages. The only published office is in Bengaluru and the Chennai entry has no street address; a "bioinformatics course Chennai" page would claim a presence the site cannot back up. Courses are marked online / in-person at the laboratory address already published, and `areaServed` is India. Add Chennai pages if a real Chennai venue is announced.
* No `AggregateRating`/`Review`, no testimonials, no placement claims.
* hreflang: the site is English only (`en-IN`); a self-referencing `hreflang="en-IN"` and `x-default` are added, with no invented alternates.
