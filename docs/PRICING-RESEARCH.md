# Vedicgen pricing: market research and rationale

Prepared October 2026. Every comparable price below was read on the provider's own page (or, where marked, only in a search
result) at that time. Prices change often: **re-check each source before quoting any of them in marketing**. The website
itself never names competitors or makes price comparisons; this document is for internal decisions only.

## 1. Comparable programmes (sources)

| Provider | Programme | Format / length | Published price | Source |
|---|---|---|---|---|
| iLearn CRI | Bioinformatics course | Online, 3 months | ₹40,000 + GST | https://ilearncri.com/courses/bioinformatics/ |
| IIT Hyderabad (CCE) | Machine Learning in Bioinformatics | Live online, Jul–Nov 2026 | ₹10,000 + GST | https://cce.iith.ac.in/live_stream/jul-nov-2026/Machine%20Learning%20in%20Bioinformatics.html |
| BDG LifeSciences | Molecular docking | Online, 10 days | ₹8,999 | https://bdglifesciences.com/event/molecular-docking |
| BDG LifeSciences | Python for Genomics | Online | ₹3,199 | https://bdglifesciences.com/event/python-for-genomics |
| RGCB | Certificate Program in Bioinformatics | 6 months | ₹35,000 / ₹70,000 (by category) | https://rgcb.res.in/cbb-internship |
| Physalia Courses | RNA-seq for beginners | Live online, 1 week | €480 | https://www.physalia-courses.org/courses-workshops/rnaseq-4-beginners/ |
| Physalia Courses | Single-cell RNA-seq with R/Bioconductor | Live online, 1 week | €530 | https://www.physalia-courses.org/courses-workshops/course18/ |
| Allele Life Sciences | Real-time PCR workshop | Hands-on, 12 hours | ₹5,000 | https://www.allelelifesciences.com/real-time-pcr-workshop.html |
| IISER Pune | Advanced real-time qPCR | Hands-on, 1 day | ₹2,596 incl. GST | https://sites.google.com/acads.iiserpune.ac.in/molbio-young-scientist/current-workshops/advanced-real-time-qpcr |
| Biotecnika | Animal cell culture workshop | In person, 3 days | ₹6,899–₹8,099 | https://stores.biotecnika.org/products/3-days-live-animal-cell-culture-workshop-at-iisc-incubated-lab-attend-offline |
| Biotecnika | CRISPR-Cas9 wet-lab training | In person, 14–15 days (+15 online) | ₹42,199 | https://stores.biotecnika.org/products/crispr-cas9-14-days-wet-lab-hands-on-training-at-iisc-incubated-lab-protein-design |
| Biotecnika | Bioinformatics internship | Online 30 days / 3 months / 6 months | ₹8,899 / ₹24,099 / ₹45,799 | https://stores.biotecnika.org/products/bioinformatics-global-research-tools-techniques-hands-on-training-cum-internship-with-project-dissertation-30-days-3-6-months-duration |
| Biotecnika | Bioinformatics internship | Offline 3 months / 6 months | ₹53,999 / ₹92,099 | same page as above |
| C-CAMP | Hands-on molecular biology & biochemical techniques | In person, 4 days | ₹20,000 incl. GST (2023; **search result only, not confirmed on page**) | https://www.ccamp.res.in/hands-training-course-molecular-biology-biochemical-techniques |

## 2. Vedicgen price architecture (as published on the site)

All prices are in INR **exclusive of 18% GST**; the site also shows the GST-inclusive amount and a USD price for international
learners. Fees live in code, so one edit changes every page, card and JSON-LD offer:

* Course tiers: `TIER_FEES` / `TIER_USD` in `src/site/data/course-types.ts`; per-course overrides in the `fees` field of each
  course in `src/site/data/courses-*.ts`.
* Programmes: `fee` in `src/site/data/programs.ts` (the site shows the sum of the separate courses crossed out).
* Internships: `DRY_OPTS` / `WET_OPTS` in `src/site/data/internships.ts`.
* Workshops, research training, institutional programmes: `src/site/data/training.ts`.

| Product type | Vedicgen price | Nearest comparables above |
|---|---|---|
| Self-paced online course (dry lab) | ₹2,499–₹5,999 (tiers ₹3,499 / ₹4,499 / ₹5,999) | BDG Python for Genomics ₹3,199 |
| Instructor-led live online course, up to 4 weeks (customisable) | ₹4,999–₹12,499 (tiers ₹8,499 / ₹10,999 / ₹12,499) | IIT-H CCE ₹10,000 + GST; BDG docking ₹8,999; Physalia €480–530 |
| In-person wet-lab course, 3–6 days (customisable) | ₹7,499–₹19,999 (NGS library prep ₹32,999) | Allele qPCR ₹5,000 (12 h); Biotecnika cell culture ₹6,899–8,099 (3 days); C-CAMP ₹20,000 (4 days) |
| Professional programme (bundle, customisable pace) | ₹23,999–₹49,999 | iLearn CRI 3 months ₹40,000 + GST; RGCB 6 months ₹35,000+ |
| Dry-lab internship | ₹6,999 (4 wk) · ₹12,999 (8 wk) · ₹17,999 (12 wk) · ₹32,999 (24 wk) | Biotecnika online ₹8,899 (30 d) / ₹24,099 (3 m) / ₹45,799 (6 m) |
| Wet-lab internship | ₹14,999 (4 wk) · ₹24,999 (8 wk) · ₹34,999 (12 wk) · ₹59,999 (24 wk) | Biotecnika offline ₹53,999 (3 m) / ₹92,099 (6 m) |
| Workshop | ₹999–₹1,999 online (₹1,999–₹2,999 professionals) · ₹2,999–₹3,999 in-person, 1 day | IISER Pune qPCR ₹2,596 incl. GST (1 day) |
| Research training | ₹1,999 per clinic session · ₹2,499/hour mentoring · ₹7,999 bootcamp · ₹19,999–₹64,999 mentored projects | — |
| Institutional (FDPs, campus workshops, certificate courses, consulting) | Quoted per participant / per engagement | — |

Rationale: Vedicgen prices started slightly below comparable programmes. **On 2026-10-14 the owner asked for course and
programme list prices to be raised by roughly 20%** so there is room to negotiate (group, early-bird or scholarship
discounts) and still land at or below the market. At the same time every course was capped at **4 weeks** with a
customisable schedule (standard, intensive 1–2 weeks, weekends only, or custom), and programme pace became customisable.
Internship, workshop and research-training fees were not changed.

Previous list prices (before 2026-10-14), for reference: self-paced ₹2,999 / ₹3,999 / ₹4,999; live ₹6,999 / ₹8,999 / ₹9,999
(6 weeks); wet lab ₹5,999–₹16,999 (NGS library prep ₹27,999); life sciences ₹3,999 live / ₹1,999 self-paced;
programmes ₹19,999–₹42,999.

## 3. Business policies to confirm before launch
These appear on the site and are commercial decisions for the owner, not facts we verified:
* 10% group discount for five or more learners from one institution (`pages/vedicgen/Admissions.tsx`).
* Up to three instalments for fees above ₹15,000 (Admissions page and course pages).
* Full refund up to 7 days before the start; transfer to a later cohort (`pages/Legal.tsx` → Refunds, and Admissions).
* Free Scientific Software Engineering internship (Nayancode), selective, no stipend.
* Wet-lab training venue: the site says "our laboratory" at the Solagene address. Confirm the laboratory is ready, or change
  wet-lab courses to "venue announced with your admission offer".
