# Plan: free tools that earn citations and a DOI for Vivofold (Nayancode Workbench)

Goal: the Nayancode Workbench and free tools become a **citable, peer-reviewed, free web resource** from Vivofold,
with DOIs, registry entries and a journal paper, while everything stays **free to host**.

Hard rule kept throughout: no paid hosting, no servers, no user accounts on the tools.

---

## 1. How each weakness is answered

| Weakness | What we do about it | Where it lives (free) |
|---|---|---|
| "Integration, not a new method" | Make the contribution explicit and defensible. (a) **Verified concordance**: every studio is benchmarked against the reference tool in CI on public data, and the numbers are published. (b) **Verifiable analysis records**: every result carries a hash of input + parameters + code version, so a reviewer can re-run it in the browser and get an identical record. This is the one genuinely new piece and becomes the paper's headline. (c) **Private by construction**: computation stays on the user's device, which matters for clinical and unpublished data. | GitHub (code), GitHub Actions (benchmarks), Zenodo (benchmark data DOI) |
| No comparison with established tools | Automated benchmark suite: expression vs **DESeq2 + limma-voom**, single-cell vs **Scanpy**, variants vs **bcftools**, phylogenetics vs **IQ-TREE / FastTree**, QSAR vs **scikit-learn**, docking-free chemistry vs **RDKit** reference values. Report correlation of log-fold changes, overlap of significant genes, adjusted Rand index of clusters, precision/recall of variant calls, Robinson–Foulds distance of trees. Reference tools run **only in CI** (GPL tools are fine there because they are not shipped). | GitHub Actions (free for public repos), results to Zenodo |
| Tight limits | Raise the ones reviewers will hit: design-matrix DE (multi-group, covariates, paired); indel calling; mapping of larger references via streaming; UMAP/t-SNE on 20–50k cells with WebGPU or approximate kNN; ML trees to ~200 taxa. Keep every remaining limit written on the page. | Browser only |
| No users, citations, case study, usability | Three real-data case studies on public datasets (GEO RNA-seq, 10x PBMC, a bacterial genome). A usability study with Vedicgen students and outside researchers (time-to-first-result, task success, SUS score), with consent. Anonymous, cookie-free usage counts. | Vedicgen courses; Cloudflare Web Analytics (free, no cookies) |
| Simplified pieces (heuristic pocket score) | Either validate against a labelled set (e.g. a public pocket benchmark) or label it "exploratory" and keep it out of the paper's claims. | — |
| "Nothing leaves your browser" | Reword everywhere: "Your files are analysed on your computer. Optional database look-ups (ClinVar, Ensembl, PubChem, PDB) send only the identifier you look up, and only when you ask." Add an on-screen network indicator (one already exists in the Workbench). | Site copy |

---

## 2. Recognition stack (all free)

| What | Gives you | When |
|---|---|---|
| **Open-source licence** (Apache-2.0 recommended) + `CITATION.cff` + `LICENSE` | Required by JOSS, expected by NAR and Bioinformatics; "Cite this repository" button on GitHub | Week 1 |
| **Zenodo + GitHub release** | A **DOI for the software**, a new version DOI on every release, plus a concept DOI that always points to the latest | Week 1 |
| **Software Heritage** archive | Permanent archive of the code (SWHID), recognised by journals | Week 1 |
| **ORCID** for every author | Links papers and DOIs to people | Week 1 |
| **bio.tools** (ELIXIR registry) | Listed where bioinformaticians search for tools; stable biotools ID | After the preprint |
| **RRID** (SciCrunch) | Research Resource Identifier; many journals ask authors to cite tools by RRID | After the preprint |
| **bioRxiv preprint** | A **DOI for the paper** within days, indexed by Google Scholar | Month 3 |
| **Peer-reviewed paper** (see §4) | The citation target | Month 4–7 |
| **ROR ID** for Vivofold | Organisation identifier; ROR asks for publications that list the organisation as affiliation, so request it **after** the preprint/paper | After first DOI |
| Google Scholar profile, Wikidata item, GitHub topics, awesome-lists, Galaxy Training Network tutorial | Discovery and citations | Ongoing |

Crossref DOIs (paid membership) are **not** needed: Zenodo and bioRxiv issue DataCite/Crossref DOIs for free.

---

## 3. New tools (all run in the browser; all free to host)

| Tool | Value | Effort | Hosting note |
|---|---|---|---|
| **Design-matrix differential expression** (multi-group, covariates, paired, contrasts) | Removes the biggest limitation; the most-requested feature | 2–3 weeks | Pure TypeScript |
| **Publication figures**: volcano, MA, heatmap, PCA as SVG/PDF | Why people cite tools: figures go straight into papers | 1 week | Pure TypeScript |
| **qPCR ΔΔCt analysis** with replicates, efficiency correction, stats | High demand in wet labs; links to Vedicgen courses and our guide | 1 week | Pure TypeScript |
| **Dose–response / IC50** (4-parameter logistic, confidence intervals) | Wet-lab and pharmacology users | 1 week | Pure TypeScript |
| **Sample-size and power** (RNA-seq, t-test, ANOVA, survival) | Used at grant-writing time, cited in methods | 1 week | Pure TypeScript |
| **BAM / VCF / BED viewer** (igv.js, already a dependency) | Everyone needs one; integrates with Genome Studio | 1 week | igv.js (MIT) |
| **Peptide and protein tools**: in-silico digest, isotope pattern, peptide mass | Proteomics users | 1 week | Pure TypeScript |
| **Primer specificity** against small genomes | Complements primer design | 2 weeks | Needs genome bundles (below) |
| **Reference-genome bundles** (E. coli, S. aureus, yeast, phage, SARS-CoV-2-free choices) | Map reads without uploading a reference | 1 week | Small genomes (<20 MB gzipped) in the repo; larger ones as a Hugging Face dataset or Zenodo record (verify CORS before relying on it) |

Hosting limits to respect on GitHub Pages: about 1 GB per site and 100 MB per file, soft bandwidth ~100 GB/month.
If traffic grows past that, move the same static build to **Cloudflare Pages** (free, unlimited bandwidth); no code changes.

---

## 4. Where to publish (choose one primary)

1. **NAR Web Server Issue** (best fit for "free web tools"). Requires: free, no login, no payment; tool not previously published.
   The issue appears each July; proposals for the 2025 issue were due around **20 December**, so the 2027 call is likely
   due late 2026. Check the call on the NAR site. Strongest option once benchmarks and case studies exist.
2. **Bioinformatics – Application Note** (2 pages + supplement). Good if the NAR deadline is missed.
3. **JOSS** for the open-source analysis library (kernels and tests) as a separate, quick, free paper. It requires an OSI
   licence, an open issue tracker, substantial code (they flag < 1,000 lines) and real development history.
4. An **education paper** (PLOS Comput Biol education section) later, built on the Vedicgen teaching use.

Rule: one journal paper per substantial piece. Do not split the same work into several papers.

---

## 5. Timeline (realistic, part-time)

| Weeks | Work | Output |
|---|---|---|
| 1 | Licence, CITATION.cff, Zenodo link, first release, Software Heritage, ORCIDs, privacy wording, GitHub org `vivofold` (optional) | **Software DOI** |
| 2–6 | Design-matrix DE, indels, SVG figures, qPCR, IC50, power, igv viewer | New tools live |
| 3–8 | Benchmark suite in CI vs DESeq2/limma, Scanpy, bcftools, IQ-TREE; benchmark data on Zenodo | **Benchmark DOI** + public results page |
| 6–9 | Three case studies; usability study (students + external users) | Supplementary material |
| 9–10 | Preprint (bioRxiv), bio.tools and RRID registration | **Paper DOI** |
| 10–12 | Submit to NAR Web Server Issue (or Bioinformatics); JOSS for the library | Peer review |
| After acceptance | ROR request, Scholar profile, Wikidata, tutorials | Citations |

---

## 6. Decisions needed from the owner

1. **Licence**: making the Workbench code open source (Apache-2.0 recommended: permissive, patent grant, company-friendly).
   The repository is already public but, without a licence, legally "all rights reserved"; JOSS and NAR need an open licence.
2. **Repository layout**: keep one repository, or move the Workbench into its own `nayancode` repository so the paper,
   DOI and citations point to the software and not to the company website. Recommended: separate repository.
3. **Authors**: names, ORCIDs and affiliation ("Vivofold, India").
4. **Usability study**: permission to invite Vedicgen students (consent form, anonymous data).
5. **Primary venue**: NAR Web Server Issue (recommended) or Bioinformatics.

Everything in this plan is free: GitHub (code, Pages, Actions), Zenodo (DOIs), Software Heritage, bioRxiv,
bio.tools, SciCrunch, ORCID, ROR, Cloudflare Pages / Web Analytics as backups.
