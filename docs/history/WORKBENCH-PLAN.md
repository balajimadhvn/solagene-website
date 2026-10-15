# Bioinformatics Workbench — Product & Technical Plan

> Status: v1 planning document · Date: 2026-10-01 · Company/brand: TBD (codename **Workbench**, package scope `@wb/`)
>
> Scope: the scientific web platform and its technical foundation only. Courses, internships, branding, marketing and business model are out of scope.

## Implementation status (updated 2026-10-02)

**Built and verified:** all nine studios, shell, design system, Atlas, Report builder, provenance/Methods, licence gate + Licences page (restricted-tool replacement table), bundled open reference data (Reactome, WikiPathways, GO BP, JASPAR, NCBI gene map), vendored MIT WebAssembly (minimap2, samtools), igv.js, Mol*, RDKit. 170+ unit tests (incl. real-structure regression on 1HSG) and a Playwright E2E suite against the production build.

**Deviations from this plan:** single Vite app (not a monorepo); kernels in TypeScript (no Rust toolchain); hash routing; clean-room TS replacements for GPL tools (MAFFT/FastTree/IQ-TREE/Primer3/PLIP/fpocket); clean-room UMAP and exact t-SNE (both in Single-Cell Studio); localStorage/IndexedDB instead of OPFS.

**Still not built:** Vina docking (needs a compiled engine or GPU tier), structure prediction, ESM-2 embeddings in-browser, DuckDB-WASM for very large VCFs, PyDESeq2, spatial image viewer, batch as a DE covariate (ComBat currently drives PCA / heatmap / export only), accounts / cloud executor / edge proxy, Rust/WASM kernels.

---

## 0. Assumptions checked before planning

The brief is sound, but several assumptions needed correcting before the architecture could hold together. Every later section follows from these corrections.

| # | Assumption in the brief | Reality | Decision |
|---|---|---|---|
| A1 | "Host on GitHub Pages" | GitHub Pages **cannot set HTTP headers**. Without COOP/COEP headers, `SharedArrayBuffer` is unavailable, so multithreaded WebAssembly is off. Without a CSP header, the security posture is weaker. GitHub's terms also say Pages is **not intended for running an online business or commercial SaaS**. Limits: 1 GB site size, 100 MB per file, about 100 GB/month bandwidth (soft limit). | Keep **GitHub as the source of truth** and use Pages only for previews or docs. Serve production from **Cloudflare Pages**: free tier, custom `_headers`, unlimited bandwidth, still deployed from GitHub. Cost stays at roughly zero. Keep a `coi-serviceworker` fallback so the app still works if it is ever served from GitHub Pages. |
| A2 | "No server at all" | Pure static hosting fails in three places: APIs without CORS (some NCBI endpoints, KEGG), API keys that must not ship to clients, and per-user rate limiting. | Allow **one optional edge function layer** (Cloudflare Workers free tier, 100k req/day) as a CORS proxy, cache and key holder. It is stateless, needs no database, and costs nothing. All core local analysis must work without it. |
| A3 | "Run as much as possible in the browser" | Browsers are excellent for interactive **secondary and tertiary analysis**: tables, matrices, structures, molecules, VCFs, small genomes. They are the wrong place for **primary analysis of real-sized raw data**, such as human WGS FASTQ→BAM→VCF, FASTQ→counts for 50 samples, metagenome assembly, or structure prediction. A human reference index alone needs 8–30 GB of RAM. | **Product thesis:** the browser owns everything after the pipeline (and pipelines on small genomes). Heavy primary analysis runs later on cloud or HPC through standard pipelines (nf-core), and its outputs open directly in the same studios. |
| A4 | Free public APIs can carry workflows | Public APIs have no SLA, rate-limit hard, and change. Several "free" databases are **not free for commercial use**: KEGG, COSMIC, OncoKB, CADD, DrugBank, OMIM, SpliceAI precomputed scores, parts of dbNSFP, and MEME Suite. | APIs **enrich** analyses but never gate a core workflow. Every API call is cached, rate-limited, and degrades gracefully. A license registry blocks restricted sources from commercial builds (§13). |
| A5 | WebAssembly scales like a desktop program | 32-bit wasm caps memory at 4 GB per instance, and in practice 1–2 GB is safe across browsers. Memory64 exists but is not universal, Safari in particular. Mobile Safari limits tabs aggressively. Threads need cross-origin isolation. | Design for **single-threaded wasm per worker plus a worker pool**. Threads are a bonus when `crossOriginIsolated` is true. Each tool declares a memory estimate; above the browser budget the UI offers cloud execution or downsampling instead of crashing. |
| A6 | Scientific Python/R "just works" in Pyodide/webR | `scanpy` depends on `numba`, which Pyodide does not have. R itself is GPL. Pyodide and webR take 10–40 MB to load. | Use **native JS/WASM engines first**: scran.js for single-cell, RDKit.js for chemistry, Rust for custom kernels. Use Pyodide only where it adds clear value (PyDESeq2, scikit-learn/XGBoost for QSAR), always lazy-loaded inside a worker. webR is optional and isolated. |
| A7 | "Professional" comes from UI polish | Researchers trust software that is **correct, reproducible and citable**. | Validation against reference tools is a product feature, published openly. So are provenance on every result and auto-generated methods text with citations (§1, Phase 8). |

---

## 1. Product vision

**A local-first scientific workbench: serious, validated bioinformatics that runs on the researcher's own machine, opens instantly in a browser, and scales to the cloud when the data outgrows the laptop.**

### Principles

1. **Few studios, deep workflows.** Nine scientific applications ("Studios"), each covering a complete workflow from data to interpretation to figures to report. No standalone calculators. Utilities such as Tm, molarity, reverse complement or unit conversion live in a global command palette and inside the studios that need them.
2. **Your data never leaves your device unless you say so.** Local computation is the default. Every outbound request, such as sending a sequence to EBI BLAST, is shown first ("this will send 1 protein sequence (342 aa) to EBI Job Dispatcher") and recorded in the provenance log. A visible network badge shows "0 bytes uploaded".
3. **Correctness is the product.** Each engine is validated against the reference implementation (DESeq2, scran/scanpy, RDKit, samtools/bcftools, MAFFT, FastTree, Vina), and the reports are public at `/validation`.
4. **Reproducible by construction.** Every result carries a provenance record: tool, version, engine build hash, parameters, input hashes, timestamp. One click exports:
   - an auto-written **Methods paragraph** with BibTeX citations for every tool and database used;
   - a **reproducible script** (Python/R/Nextflow) where an equivalent exists;
   - an **RO-Crate** project archive.
5. **Same analysis, any execution target.** A job specification runs in a browser worker today and on a GPU cluster or institutional SLURM tomorrow, with no UI change (§11).
6. **Standards over inventions.** Standard formats in and out (FASTA/GenBank/GFF3/BAM/CRAM/VCF/h5ad/Zarr/SpatialData/mmCIF/SDF/SMILES). GA4GH standards for future backends (WES/TES/DRS/htsget/refget/VRS).

### Suggestions to make the platform premium and established

These cost little and signal maturity to scientists:

- **Public validation dashboard.** For every engine: dataset, reference tool version, concordance metrics (for example DESeq2 log2FC Pearson r > 0.999, adjusted p-value agreement, single-cell ARI vs scran). Rerun in CI on every release.
- **Citable releases.** Semantic versioning, a Zenodo DOI per release, a `CITATION.cff` file, and a peer-reviewed application note. The *NAR Web Server Issue* requires free, login-free access, which this architecture provides by default. This is the fastest route to credibility in academic India and abroad.
- **Open-core engines.** Open-source the parsers, viewers and compute adapters (Apache-2.0). Researchers cite and contribute to open tools, and closed commercial value can sit in cloud execution, collaboration and enterprise features later.
- **Interoperability with nf-core.** The studios open nf-core pipeline outputs directly (rnaseq, sarek, scrnaseq, ampliseq, mag, viralrecon). Professionals who already run pipelines on HPC get an immediate reason to use the platform.
- **AI-native, grounded, optional.**
  - In-browser protein language models (ESM-2 small via ONNX Runtime Web/WebGPU) for embeddings and zero-shot mutation-effect scoring.
  - Molecular embeddings for chemistry.
  - Later, an **assistant that operates the workbench** through the same typed job API, so every step it takes is visible, editable and reproducible. It never acts as an opaque chatbot.
  - Expose workbench tools as an **MCP server** later so external AI agents can drive validated analyses.
- **Unified entity layer ("Atlas").** Any gene, protein, variant, compound or structure mentioned anywhere is clickable. It opens a knowledge card built from public sources (UniProt, Ensembl, PDB/AlphaFold DB, ChEMBL, PubChem, ClinVar, Open Targets) and links across studios: variant → protein position on structure → known ligands → chemistry.
- **Offline-capable PWA.** Many Indian institutes have unreliable bandwidth. After first load, studios, engines and reference packs are cached and work offline.
- **Data-residency story ready from day one.** Local-first now. Indian cloud regions (Mumbai/Hyderabad) for the future backend, aligned with the DPDP Act 2023.
- **Built-in example datasets and guided walkthroughs** in every studio, using real public datasets with citations. Every studio becomes usable in under 30 seconds.

---

## 2. Final scientific application structure

### 2.1 Overview

| # | Studio | Core workflow | Primary users |
|---|---|---|---|
| 1 | **Sequence Studio** | sequence → annotate → design (primers/cloning/CRISPR) → align/search → export | students, wet-lab biologists, molecular biologists |
| 2 | **Alignment & Phylogenetics Studio** | sequences → MSA → curate/trim → tree → annotate/compare → figure | evolutionary biologists, microbiologists, epidemiologists, students |
| 3 | **Genome Studio** | reads/assemblies/tracks → QC → align (small genomes) → assess → compare → annotate → browse | genomics researchers, microbiologists, core facilities |
| 4 | **Variant Studio** | VCF/MAF → QC → annotate → filter/prioritize → interpret (germline / somatic / population) → report | human geneticists, cancer researchers, clinicians (research use) |
| 5 | **Expression Studio** | count/quant matrix → QC → normalize → DE → enrichment → figures (bulk RNA-seq; proteomics later) | the largest academic user group |
| 6 | **Single-Cell & Spatial Studio** | matrix → QC → normalize → reduce → cluster → annotate → markers/DE → (spatial context) | single-cell labs, immunology, developmental biology |
| 7 | **Microbiome Studio** | feature table (+ tree, taxonomy, metadata) → diversity → ordination → differential abundance; 16S read classification for small runs | microbiome, environmental, agricultural and clinical microbiology |
| 8 | **Structure Studio** | protein sequence/structure → features → pockets → interactions → comparison/RMSD → docking (lite) | structural biologists, biochemists, drug-discovery scientists |
| 9 | **Chemistry Studio** (includes **QSAR Lab**) | molecules/library → curate → properties/filters → similarity/substructure/scaffolds → QSAR model → validation → prediction | medicinal chemists, cheminformaticians, pharma/CRO scientists |

**Cross-cutting (not studios):** Atlas entity cards, Project workspace, Job Center, Command palette (utilities), Report builder, Provenance/Methods export.

### 2.2 Areas from the brief that were consolidated rather than given their own app

| Area | Where it lives | Why |
|---|---|---|
| Sequence similarity / BLAST | Sequence Studio → Search; Structure Studio (protein) | A search step inside a workflow, not a destination. |
| Assembly analysis | Genome Studio → Assembly module | Shares data model and viewers with genome browsing and comparison. |
| Cancer genomics / liquid biopsy | Variant Studio → **Somatic mode** | Same file types (VCF/MAF/SEG), annotation and filtering engine. A separate app would duplicate about 70% of Variant Studio. |
| Protein bioinformatics + structural + protein–ligand | Structure Studio | Researchers move sequence → structure → pocket → ligand continuously. Splitting breaks the flow. |
| Cheminformatics + similarity/substructure + QSAR/AI drug discovery | Chemistry Studio with QSAR Lab | One molecule-table data model. QSAR is a workspace on top of a curated library. |
| Epigenomics (ChIP/ATAC peaks, bigWig, motifs) | Genome Studio → **Regions & Tracks** module | Interval operations, peak annotation and motif scanning share the genome browser and annotation core. |
| GWAS summary statistics | Variant Studio → **Population mode** | Manhattan, QQ and LocusZoom-style views plus annotation of lead variants. |
| Pathway/network analysis | Component inside Expression and Single-Cell (enrichment, STRING network) | Rarely a standalone task; always downstream of a gene list. |
| Proteomics / metabolomics quant tables | Expression Studio, later phase | Same matrix → normalize → DE → enrichment workflow. |
| Pathogen / viral genomics | Genome Studio microbial mode, with Nextclade integration (MIT, already in-browser Rust/WASM) | Relevant for India (surveillance, AMR) without a separate app. |

### 2.3 Studio specifications

Notation:
- **JS**: TypeScript on the main thread (UI and light logic only).
- **W**: Web Worker running TypeScript.
- **WASM-C**: C/C++ tool compiled with Emscripten.
- **WASM-R**: our own Rust kernel compiled with wasm-bindgen.
- **PY**: Pyodide in a worker.
- **ONNX**: ONNX Runtime Web (WebGPU with WASM fallback).

---

#### 1. Sequence Studio

- **What it does:** a SnapGene/Benchling-class sequence workspace. Edit, annotate and visualize DNA/RNA/protein; design primers, cloning and CRISPR guides; align and search.
- **Real use cases:** a student checks an ORF and designs primers; a lab plans a Gibson assembly; a researcher verifies Sanger reads against a plasmid map; a scientist translates and analyzes a protein.
- **Inputs:** FASTA, GenBank, EMBL, SnapGene `.dna` (reader exists in open-source parsers; verify license), AB1/SCF chromatograms, plain text, accession IDs (NCBI/ENA/UniProt fetch).
- **Outputs:** annotated GenBank/FASTA, primer tables (CSV), cloning protocols, SVG/PNG maps, alignment reports.
- **Analysis modules:**
  - *Sequence core:* reverse complement, translation (all NCBI genetic codes), six-frame ORF finder, composition and GC (windowed), codon usage, MW/pI/extinction coefficient for proteins, motif and regex search, IUPAC handling.
  - *Annotation:* feature editing, auto-annotation of common plasmid features against a bundled feature library (built from public-domain/CC0 sources only), restriction sites (REBASE data: check terms; enzyme names and sites are facts and can be compiled from many sources).
  - *Primer design:* Primer3 engine. Our own nearest-neighbor Tm (SantaLucia 1998 / Owczarzy salt correction), hairpin and dimer checks, in-silico PCR against the loaded sequence or a user-provided genome (small).
  - *Cloning simulation:* restriction/ligation, Gibson/HiFi, Golden Gate (Type IIS), Gateway, with resulting-construct preview and history.
  - *Chromatogram/Sanger:* trace viewer, quality trimming, alignment of reads to a reference, mismatch calling.
  - *Pairwise alignment:* global, local, semi-global (affine gaps), dotplot.
  - *Similarity search:* local search against user-supplied FASTA databases (MMseqs2 WASM or our SIMD Smith-Waterman for small DBs); remote BLAST via EBI Job Dispatcher (consented).
  - *CRISPR (later):* guide enumeration for Cas9/Cas12a, on-target scoring (permissively licensed models only), off-target search for loaded sequences and small genomes. Genome-wide human off-targets need cloud or a precomputed index.
  - *Codon optimization (later):* host codon tables (Kazusa-derived tables: check terms; or compute from Ensembl/NCBI CDS sets).
- **Visualizations:** circular/linear plasmid map, sequence view with features and translation tracks, restriction map, primer overlay, chromatogram, dotplot, alignment view.
- **Browser feasibility:** ✅ Fully local.
- **Engines:** JS for editing and rendering; W for ORFs, digests and composition on long sequences; WASM-C for Primer3, MMseqs2 and parasail/WFA2; WASM-R for SIMD Smith-Waterman and in-silico PCR.
- **APIs:** NCBI E-utilities and ENA for accession fetch; EBI Job Dispatcher for BLAST/InterProScan (optional).
- **Limits:** sequences up to about 10 Mb interactive (bacterial chromosome). Local search DB up to about 1–2 GB FASTA with MMseqs2 (verify in spike); larger DBs go to remote search.
- **Cloud later:** genome-wide CRISPR off-targets, large-database homology search.

---

#### 2. Alignment & Phylogenetics Studio

- **What it does:** multiple sequence alignment, curation, tree inference and publication-grade tree visualization.
- **Use cases:** gene family evolution, outbreak/strain relatedness, 16S/ITS phylogeny, conservation analysis before mutagenesis, teaching phylogenetics.
- **Inputs:** FASTA (unaligned/aligned), Clustal, Stockholm, PHYLIP, NEXUS, Newick/NHX, metadata TSV (dates, locations, traits).
- **Outputs:** alignments (FASTA/Clustal/Stockholm), trimmed alignments, Newick/NEXUS trees, annotated tree SVG/PDF, distance matrices, conservation tables.
- **Analysis modules:**
  - *MSA:* MAFFT (auto/L-INS-i/FFT-NS-2), MUSCLE5, Clustal Omega via EBI API (GPL, so remote only).
  - *Curation:* gap and column trimming (our own trimAl-style logic; trimAl is GPL, so reimplement), sequence filtering, realignment of a region, manual editing.
  - *Conservation:* per-column entropy and Jensen-Shannon, consensus, sequence logo, identity matrix.
  - *Distances and fast trees:* p-distance, JC69, K2P, TN93; NJ, BIONJ, UPGMA (our own implementation).
  - *Maximum likelihood:* FastTree (GPL, isolated module) for ≤ ~10k sequences; IQ-TREE 2 WASM (GPL, isolated; experimental) for small alignments with model selection. Bootstrap / SH-aLRT support.
  - *Tree tools:* rooting (midpoint, outgroup), ladderize, collapse by support, prune, compare (Robinson-Foulds), tanglegram.
  - *Temporal (later):* root-to-tip regression; TreeTime-style dating (TreeTime is MIT, Python; Pyodide spike).
  - *Codon analysis (later, cloud):* dN/dS (HyPhy is MIT but heavy; cloud).
- **Visualizations:** canvas MSA viewer (virtualized for 10k × 30k), logo, conservation track, rectangular/circular/unrooted trees with metadata color/strips/heatmap annotations, tanglegram, root-to-tip plot.
- **Browser feasibility:** ✅ for typical sizes; ⚠️ ML with heavy bootstraps is slow.
- **Engines:** WASM-C for MAFFT, MUSCLE5 and FastTree; WASM-R for distances, NJ, conservation and RF distance; W for orchestration and parallel bootstrap replicates across the worker pool.
- **APIs:** EBI Job Dispatcher (Clustal Omega, MAFFT for large jobs).
- **Limits:** MAFFT local ≤ ~2,000 sequences × 2 kb (fast modes larger). FastTree ≤ ~10k tips. Viewer ≤ ~50k tips (canvas).
- **Cloud later:** IQ-TREE/RAxML-NG on large alignments, dating with BEAST (LGPL; cloud), dN/dS.

---

#### 3. Genome Studio

- **What it does:** work with reads, assemblies, alignments and genomic tracks for **small genomes locally** (viral, bacterial, fungal, organelle) and **any genome via indexed remote files**.
- **Use cases:** assess a bacterial assembly; check coverage of a viral genome; compare two strains (ANI, synteny); browse ChIP/ATAC peaks; annotate peaks with nearest genes; QC a FASTQ before sending it to a pipeline; inspect a BAM from a core facility.
- **Inputs:** FASTQ(.gz), FASTA, BAM/CRAM(+index), BED, bigWig/bigBed, GFF3/GTF, 2bit, VCF (display), PAF, remote URLs with range requests.
- **Outputs:** QC reports (HTML/JSON), BAM/PAF (small), coverage tables, assembly QC tables, comparison plots, annotated BED/TSV, filtered reads.
- **Modules:**
  - *Read QC:* streaming FASTQ statistics (quality per position, length, GC, duplication estimate, adapter content, overrepresented k-mers), plus trimming/filtering with fastp (MIT). Works on multi-GB files by streaming.
  - *Alignment (small references):* minimap2 (MIT) for long and short reads to viral/bacterial references; samtools (MIT/BSD) for sort, index, depth, flagstat and stats; consensus calling. Human-scale mapping is excluded (A3).
  - *Assembly QC:* N50/NG50/L50, length distribution, GC vs coverage (blob-style), contig-level stats, misassembly hints via read mapping. Completeness via **miniprot + BUSCO lineage datasets** (compleasm approach; small lineages such as bacteria/fungi). Contamination screening via k-mer sketches (later).
  - *Comparative genomics:* ANI via skani (MIT) or sourmash (BSD-3), dotplots and synteny from minimap2 PAF, pan-genome presence/absence viewer for user-supplied gene tables (Panaroo/Roary outputs).
  - *Annotation browsing and light annotation:* GFF3/GTF viewer; gene prediction for prokaryotes via Prodigal (GPL-3, isolated module; reimplementation optional); functional annotation via remote API or cloud.
  - *Regions & Tracks (epigenomics):* bedtools-style interval operations (intersect, merge, closest, coverage; our own Rust implementation or bedtools WASM (MIT)), peak annotation (promoter/exon/intron/intergenic, nearest TSS), peak-set overlaps (UpSet), signal profiles and heatmaps around TSS/summits from bigWig, motif scanning with JASPAR (CC BY 4.0) PWMs (our own implementation). MEME/HOMER are licence-restricted or GPL; see §13.
  - *Microbial mode (later):* AMR gene detection with AMRFinderPlus (public domain, NCBI) database and logic (WASM spike; else cloud), MLST (PubMLST data terms apply; verify), Nextclade integration for viral clades.
- **Visualizations:** genome browser (igv.js) with tracks, coverage plots, dotplot/synteny, blob plot, QC panels, interval UpSet, TSS profile and heatmap.
- **Browser feasibility:**
  - ✅ Read QC (streaming) and small-genome alignment/assembly QC.
  - ✅ Remote browsing of indexed files of any size.
  - ❌ Human-scale alignment and assembly.
- **Engines:** WASM-C for minimap2, samtools/htslib, fastp, miniprot, skani and Prodigal (isolated); WASM-R for interval engine, stats, k-mers and PWM scanning; W for streaming parsers built on `@gmod/*` libraries.
- **APIs:** UCSC/Ensembl/NCBI for reference genomes and annotations; AWS Open Data / igv.org-hosted genome JSONs; ENA for read and assembly fetch (small).
- **Limits:**
  - FASTQ QC: any size, time-bound at roughly 50–150 MB/s.
  - minimap2: references ≤ ~100 Mb, reads ≤ ~2–4 GB.
  - BUSCO-style completeness: bacteria/fungi lineages.
  - Remote BAM/bigWig: unlimited (indexed range requests, CORS required on the host).
- **Cloud later:** assembly (Flye BSD, SPAdes GPL, hifiasm MIT), human alignment and variant calling (nf-core/sarek), full annotation (Bakta GPL, Prokka GPL), large-database contamination screening.

---

#### 4. Variant Studio

- **What it does:** explore, annotate, filter, prioritize and report variants in **Germline**, **Somatic (cancer / liquid biopsy)** and **Population (GWAS summary)** modes.
- **Use cases:** prioritize candidate variants in a trio exome; review a tumor panel VCF; compute TMB and mutational signatures across a cohort; annotate GWAS lead SNPs; check ClinVar/gnomAD evidence for a variant list; estimate ctDNA tumor fraction from called variants.
- **Inputs:** VCF/BCF(.gz + tbi/csi), gVCF, MAF, SEG (copy number), PED, sample metadata, GWAS summary statistics (TSV, GWAS-SSF), gene panels (BED/list), HPO term lists.
- **Outputs:** filtered and annotated VCF/TSV/Excel, variant reports (HTML/PDF), cohort plots, signature exposures, Parquet tables.
- **Modules:**
  - *Ingest & QC:* parse into **Parquet/Arrow via DuckDB-WASM**. Per-sample metrics: Ti/Tv, het/hom ratio, depth, GQ distributions; sex check from X heterozygosity; relatedness on small cohorts (KING-style kinship on common sites).
  - *Annotation:*
    - Local consequence prediction with `bcftools csq` (MIT) using GFF3 plus reference FASTA (small genomes local; human via remote indexed FASTA where possible).
    - Ensembl VEP REST (≤ 200 variants per POST, rate-limited) for richer human annotation.
    - MyVariant.info for ClinVar, gnomAD and dbSNP aggregation (per-field licence awareness).
    - ClinVar (public domain), gnomAD (open), CIViC (CC0) for cancer.
    - AlphaMissense scores (CC BY 4.0 per current terms; verify) via a hosted lookup pack.
  - *Filtering & prioritization:* a visual query builder producing SQL over DuckDB; inheritance models (dominant, recessive, compound het, de novo with PED); gene-panel filters; HPO-driven gene ranking (HPO free with attribution).
  - *ACMG/AMP evidence helper:* a structured evidence checklist and summary. **Research use only**, never an automated classifier (§12).
  - *Somatic mode:* oncoplot (waterfall), lollipop plots on protein domains, TMB, VAF distributions and clonality hints, **mutational signature refitting** (NNLS/SigProfiler-style), CNV segment views (genome-wide and per-gene), CIViC actionability, cohort comparisons.
    - *Liquid biopsy subset (browser-realistic):* VAF/ctDNA fraction estimation from provided calls, longitudinal VAF tracking across timepoints, fragment-length distribution from small targeted BAMs (samtools WASM). UMI consensus and calling stay on the pipeline/cloud side.
  - *Population mode:* Manhattan/QQ, genomic inflation (λ), lead-variant clumping (distance-based; LD-based via remote LD API or cloud), LocusZoom-style regional plots (locuszoom.js MIT), annotation of lead variants.
- **Visualizations:** virtualized variant grid, filter funnel, per-sample QC panels, igv.js locus view, lollipop, oncoplot, signature bar/exposure plots, CNV genome plot, Manhattan/QQ/regional plots.
- **Browser feasibility:**
  - ✅ Panel, exome, cohorts of panels, somatic cohorts (MAF).
  - ⚠️ Single-sample human WGS VCF (~5M variants) works through streamed conversion to Parquet on machines with ≥ 8 GB RAM.
  - ❌ Large joint-called cohorts (100s of WGS).
- **Engines:** WASM-C for htslib/bcftools; DuckDB-WASM for queries; WASM-R for VCF→Arrow fast path, kinship and NNLS; JS for the grid and plots.
- **APIs:** Ensembl REST/VEP, MyVariant.info, ClinVar (E-utilities), CIViC, gnomAD (light use), Open Targets, UniProt (domains for lollipops), cBioPortal (public cohort comparison).
- **Limits:** about 5–10M variant rows in DuckDB-WASM depending on RAM. VEP REST is practical for ≤ ~10k variants per session; larger sets use local `bcftools csq` or cloud VEP.
- **Cloud later:** joint calling and cohort QC, full VEP with plugins, LD computation, PRS, somatic calling from BAM, UMI-aware ctDNA pipelines.

---

#### 5. Expression Studio (bulk RNA-seq first; proteomics/metabolomics matrices later)

- **What it does:** a complete bulk differential expression workflow from count matrix to publication figures and enrichment.
- **Use cases:** treated vs control RNA-seq with replicates; time course; multi-factor designs with batch; re-analysis of GEO datasets; comparing results of contrasts.
- **Inputs:**
  - Count matrices (TSV/CSV/Excel) and sample sheets.
  - nf-core/rnaseq outputs (salmon `quant.sf`, featureCounts, `tximport`-style gene matrices).
  - GEO series matrix / supplementary counts (fetched via E-utilities/GEO FTP over HTTPS where CORS allows; else the proxy).
- **Outputs:** DE tables (CSV/Excel), normalized matrices, enrichment tables, figure SVG/PNG/PDF, HTML report with methods and citations.
- **Workflow:**
  1. *Import & design:* sample-sheet editor, factor and level definition, design-formula builder (with validation for confounding and rank deficiency), contrast builder.
  2. *QC:* library sizes, detected genes, count distributions, sample correlation heatmap, PCA (with factor coloring and loadings), hierarchical clustering, outlier flags.
  3. *Normalization:* DESeq2 median-of-ratios, TMM, CPM/TPM (with lengths), VST/rlog for visualization.
  4. *Differential expression:* **PyDESeq2** (MIT) in Pyodide as the primary reference-grade engine, plus a fast native **limma-voom-style** engine in Rust/TS. Both are validated against R DESeq2/limma. Wald and LRT tests, LFC shrinkage (apeGLM-equivalent if feasible; else `normal`), independent filtering, BH FDR.
  5. *Exploration:* volcano, MA, heatmaps of top genes (clustered), gene-level count plots, contrast overlaps (UpSet), comparison of DE methods.
  6. *Enrichment:* ORA (hypergeometric) and **preranked GSEA** (fgsea-style multilevel algorithm in Rust). Bundled GO (CC BY 4.0) and Reactome (CC BY 4.0) gene sets for human, mouse and common model organisms. MSigDB collections where licence permits. g:Profiler/Enrichr APIs optional.
  7. *Networks:* STRING (CC BY 4.0) API for PPI subnetworks of DE genes (Cytoscape.js).
  8. *Report:* figures, tables, parameters and auto-generated methods text.
- **Later modules:**
  - Batch correction (ComBat-seq reimplementation, or removeBatchEffect-style linear model for visualization).
  - Time-course/LRT designs, deconvolution with reference signatures (NNLS).
  - **Proteomics** (MaxQuant/DIA-NN/FragPipe matrices: missing-value handling, limma-style DE).
  - **Metabolomics** tables.
- **Browser feasibility:** ✅ Ideal browser workload. 60k genes × several hundred samples is a few hundred MB at most.
- **Engines:** PY for PyDESeq2 (lazy); WASM-R for limma-voom-like fitting, GSEA and clustering; W for PCA (randomized SVD); JS for plots.
- **APIs:** Ensembl/MyGene.info for ID mapping (or bundled mapping tables), g:Profiler, Enrichr, STRING, GEO via E-utilities.
- **Limits:** ≤ ~1,000 samples comfortably. PyDESeq2 fit time grows with samples × genes (spike to benchmark).
- **Cloud later:** FASTQ→counts via nf-core/rnaseq (salmon/STAR); the outputs drop straight into this studio.

---

#### 6. Single-Cell & Spatial Studio

- **What it does:** interactive single-cell RNA-seq analysis from matrix to annotated clusters and markers, then spatial transcriptomics on top.
- **Use cases:** analyze a 10x run (5k–100k cells); annotate clusters with markers; compare conditions; explore public atlases; inspect Visium spatial domains and spatially variable genes.
- **Inputs:** 10x MTX folder or `.h5`, `.h5ad` (AnnData), Zarr-AnnData, Seurat-exported matrices (not `.rds`), CSV/TSV matrices, nf-core/scrnaseq outputs. For spatial: Visium (Space Ranger outputs), SpatialData Zarr, Xenium/MERFISH cell tables (downsampled).
- **Outputs:** `.h5ad` with embeddings, clusters and annotations; marker tables; figures; session state.
- **Workflow:**
  1. QC: counts, genes and mito fraction per cell; adaptive outlier thresholds; doublet scoring (scDblFinder-like simulation, later).
  2. Normalization (log-norm with size factors), highly variable genes.
  3. PCA, batch integration (MNN via scran.js; Harmony reimplementation later).
  4. kNN graph, clustering (Leiden/Louvain, SNN), t-SNE/UMAP.
  5. Marker detection (scran-style pairwise effect sizes, Wilcoxon AUC).
  6. Cluster annotation: marker-based; reference-based label transfer (SingleR-style, available in scran.js ecosystem) with bundled small references (licence-checked, e.g. CellTypist models; verify license per model).
  7. Pseudobulk DE between conditions (reusing the Expression Studio DE engine). This is the statistically correct approach, so it is the default.
  8. Gene set scoring, cell-cycle scoring.
  9. Spatial module: tissue image overlay, spot/cell maps, spatial neighbor graphs, Moran's I spatially variable genes, spatial domain clustering, NNLS deconvolution of spots with a single-cell reference.
- **Visualizations:** WebGL embedding scatter (millions of points, regl-scatterplot), dot plot, violin/ridge, feature plots, cluster composition bars, marker heatmap, linked selection everywhere (lasso in UMAP → DE of selection), spatial viewer with image pyramids (Viv, MIT).
- **Browser feasibility:**
  - ✅ ≤ ~100–200k cells (kana/scran.js has proven this).
  - ⚠️ 200k–500k cells on strong desktops.
  - ❌ Atlas-scale (millions) analysis, which needs cloud.
  - Viewing large precomputed atlases works with on-demand Zarr chunks.
- **Engines:** **scran.js / bakana** (MIT, C++→WASM, the kanaverse ecosystem) as the core; h5wasm for HDF5; zarrita.js for Zarr; WASM-R for Moran's I and spatial graphs; W for everything; PY not needed.
- **APIs:** CELLxGENE Census/Discover for public datasets (where CORS and terms allow); Human Protein Atlas (CC BY-SA 4.0: note share-alike) for marker reference.
- **Limits:** memory is the binding constraint, about 1.5 GB per wasm instance. A sparse 100k-cell × 33k-gene matrix at ~2k genes/cell is about 1.6 GB as CSR with float32 values and int32 indices, too tight. **Stream-load and filter to HVGs early**, or use the Rust loader with int16 counts. Must be validated in a spike.
- **Cloud later:** atlas-scale integration (scVI etc. on GPU), RNA velocity, CellRanger/STARsolo, Xenium/Visium HD full-resolution analysis, image segmentation.

---

#### 7. Microbiome Studio

- **What it does:** downstream analysis of amplicon (16S/18S/ITS) and shotgun profiles. 16S taxonomic classification works locally for modest runs.
- **Use cases:** compare gut microbiota between groups; soil/agricultural microbiome surveys; clinical microbiome studies; teaching diversity analysis.
- **Inputs:** feature/OTU/ASV tables (BIOM v1 JSON / v2 HDF5, TSV), taxonomy tables, phylogenetic tree (Newick), sample metadata, QIIME 2 `.qza` artifacts (they are zip files containing standard formats), nf-core/ampliseq and MetaPhlAn/Kraken/Bracken reports. Small 16S FASTQ/FASTA for local classification.
- **Outputs:** diversity tables, ordinations, differential-abundance tables, taxonomy bar plots, reports.
- **Modules:**
  - Import and filtering: prevalence/abundance filters, rarefaction curves, optional rarefying.
  - Taxonomy composition: stacked bars and interactive sunburst/Krona-style chart at any rank.
  - Alpha diversity: observed, Shannon, Simpson, Chao1, Faith's PD; group tests (Kruskal-Wallis/Wilcoxon).
  - Beta diversity: Bray-Curtis, Jaccard, Aitchison (CLR), weighted/unweighted UniFrac (our own Rust implementation). PCoA, NMDS, PERMANOVA (permutation test in Rust, workers in parallel), PERMDISP.
  - Differential abundance: CLR + Welch/Wilcoxon (ALDEx2-like Monte-Carlo), **LinDA** (simple, robust, implementable), ANCOM-BC2 via webR as an optional isolated module (GPL; later).
  - Local 16S classification: a naive Bayes k-mer classifier (RDP-style; our own implementation) trained on **Greengenes2** (BSD) or **GTDB** (CC BY-SA 4.0: share-alike for derived DBs) reference packs hosted on object storage.
- **Visualizations:** taxa bars, sunburst, rarefaction curves, alpha boxplots, PCoA/NMDS with ellipses, DA forest/volcano, heat trees (later).
- **Browser feasibility:** ✅ Tables and small 16S classification. ❌ Shotgun read classification against full databases (Kraken2 standard DB ~ 8–70 GB).
- **Engines:** WASM-R for distances, UniFrac, PERMANOVA and the classifier; W for orchestration; JS for plots.
- **APIs:** none required. MGnify (EBI) optional for public study import.
- **Limits:** ≤ ~5k samples × 50k features. Classification ≤ ~1M amplicon reads.
- **Cloud later:** DADA2 denoising (LGPL; nf-core/ampliseq), shotgun profiling (MetaPhlAn MIT, Kraken2 MIT), MAG workflows (nf-core/mag), functional profiling.

---

#### 8. Structure Studio

- **What it does:** protein sequence → features → structure → pockets → interactions → comparison → docking. Centered on Mol*.
- **Use cases:** visualize a PDB/AlphaFold model; map variants or conserved residues onto a structure; find binding pockets; analyze ligand interactions; compare apo and holo or wild-type and mutant (RMSD/TM-score); dock a few ligands into a pocket; make publication images.
- **Inputs:** PDB/mmCIF/BinaryCIF, PDB IDs, UniProt IDs (→ AlphaFold DB), sequences, SDF/MOL2/SMILES ligands, PAE JSON, trajectories (DCD/XTC, viewing only, small), cryo-EM maps (via EMDB, view only).
- **Outputs:** annotated structures, interaction tables (CSV), pocket reports, superposition files, docking poses (SDF/PDBQT), images/movies, session files.
- **Modules:**
  - *Protein sequence features:* physicochemical properties, hydropathy, disorder (IUPred-style: check licence; or a permissive predictor), signal peptide/transmembrane (remote APIs where licensed), domains via **InterPro/Pfam** (EBI API), conservation from Alignment Studio, PLM embeddings and **zero-shot mutation scanning** with ESM-2 small (35M/150M, MIT) via ONNX/WebGPU (later).
  - *Structure core:* load, select, measure; secondary structure (DSSP, BSD-2); SASA (FreeSASA, MIT); contacts and clashes; B-factor/pLDDT coloring; PAE viewer; residue-level mapping of any per-residue data (variants from Variant Studio, conservation, ESM scores).
  - *Pockets:* fpocket (MIT) WASM; pocket descriptors and druggability; ligand-site comparison.
  - *Interactions:* our own **PLIP-equivalent interaction profiler** in TypeScript/Rust (H-bonds, hydrophobic, π-π, π-cation, salt bridges, halogen bonds, water bridges, metal coordination). PLIP itself is GPL-2, so reimplement from published geometric criteria. 2D interaction diagrams.
  - *Comparison:* sequence-dependent superposition (Kabsch), TM-align/US-align (licence permits use and modification; verify redistribution terms), per-residue RMSD, multi-structure overlay.
  - *Docking (lite):* AutoDock Vina (Apache-2.0) in WASM, as proven by the Webina project. Receptor and ligand preparation (protonation via a simple rule-based tool; Meeko is Apache-2.0 / LGPL parts, so verify), box placement from pocket or ligand, pose viewing with interaction profiling. Batch ≤ ~20–50 ligands.
  - *Structure prediction:* **not in browser.** Fetch AlphaFold DB models; future cloud GPU with Boltz-2 (MIT), OpenFold3 (Apache-2.0) or Chai-1 (Apache-2.0; verify weights terms). AlphaFold 3 weights are non-commercial only.
- **Visualizations:** Mol* 3D, sequence-structure linked view, pLDDT/PAE plots, interaction diagrams (2D), pocket list with 3D highlighting, RMSD plots, docking score tables.
- **Browser feasibility:** ✅ Visualization, analysis and pockets. ⚠️ Docking (single and small batches). ❌ Prediction and MD.
- **Engines:** JS for Mol*; WASM-C for DSSP, FreeSASA, fpocket, TM-align and Vina; WASM-R for the interaction profiler and Kabsch; ONNX for ESM-2.
- **APIs:** RCSB PDB (Data/Search/ModelServer), PDBe, AlphaFold DB, UniProt, InterPro, EMDB, SIFTS mappings.
- **Limits:**
  - Mol* handles very large assemblies (ribosomes, viruses).
  - Vina WASM: about 1–10 min per ligand depending on box and exhaustiveness.
  - ESM-2 150M on WebGPU: sequences ≤ ~1,000 aa.
- **Cloud later:** structure prediction and complexes, virtual screening (Vina-GPU/Uni-Dock: verify licences), MD (OpenMM, MIT/LGPL parts), free-energy methods, generative design (RFdiffusion BSD, ProteinMPNN MIT).

---

#### 9. Chemistry Studio (with QSAR Lab)

- **What it does:** a molecule-table workspace for drawing, curating, filtering, searching and modeling compound libraries, with QSAR from dataset to validated prediction.
- **Use cases:**
  - A medicinal chemist triages a vendor library by properties and PAINS.
  - Similarity search of actives against an in-house set; scaffold analysis of an SAR series.
  - Build and validate a QSAR model from ChEMBL IC50 data and predict new designs.
  - Export curated sets for docking in Structure Studio.
- **Inputs:** SMILES/CSV/Excel, SDF/MOL, drawn structures (Ketcher), ChEMBL/PubChem queries, InChI/InChIKey.
- **Outputs:** curated SDF/CSV, property tables, similarity hits, clustered sets, models (portable JSON/ONNX), prediction tables with applicability domain, reports.
- **Modules:**
  - *Molecule workspace:* Ketcher editor (Apache-2.0); RDKit.js depiction; virtualized grid with structure thumbnails; per-molecule cards (Atlas: ChEMBL, PubChem).
  - *Curation & standardization:* salt stripping, neutralization, tautomer canonicalization, stereo checks, duplicate detection by InChIKey, invalid structure flags. RDKit MolStandardize is available in RDKit.js; verify coverage, else use Pyodide RDKit.
  - *Properties & filters:* MW, cLogP, TPSA, HBD/HBA, rotatable bonds, Fsp3, QED, Lipinski/Veber/Ghose rules, PAINS/Brenk/NIH alerts (RDKit FilterCatalog), simple ADMET rules. ML-based ADMET only with permissively licensed models and data.
  - *Search:* substructure (SMARTS) with fingerprint prefilter; similarity (Morgan/ECFP, FCFP, MACCS, atom-pair; Tanimoto/Dice) via bit-packed fingerprints in typed arrays with WASM-R popcount scans; MCS (RDKit FMCS, small sets).
  - *Library analysis:* Butina clustering, Bemis-Murcko scaffolds and scaffold trees, chemical-space maps (PCA/UMAP on fingerprints), diversity picking (MaxMin), property distributions vs reference sets (e.g. approved drugs).
  - *SAR:* R-group decomposition, matched molecular pairs (later), activity cliffs (SALI).
  - *QSAR Lab:*
    1. *Dataset:* import or ChEMBL fetch (target → activities → unit harmonization → pIC50, aggregation of replicates, conflicting-value flags).
    2. *Featurization:* fingerprints, RDKit 2D descriptors, plus user columns.
    3. *Splitting:* random, scaffold, cluster, temporal.
    4. *Models:* Random Forest, gradient boosting (XGBoost/scikit-learn in Pyodide), kNN, SVM, ridge/PLS. Classification and regression.
    5. *Validation:* k-fold CV, external test set, Y-randomization, metrics (R², RMSE, MAE, ROC-AUC, PR-AUC, MCC), learning curves.
    6. *Interpretability:* feature importance, SHAP (TreeSHAP), atom-level contribution maps.
    7. *Applicability domain:* fingerprint distance to training set, leverage.
    8. *Prediction:* batch prediction with AD flags; export of a model card (OECD QSAR principles).
    9. *Deep models (cloud, later):* Chemprop (MIT) GNNs on GPU.
- **Visualizations:** structure grids, property histograms and radar plots, chemical-space scatter (WebGL), scaffold trees, similarity heatmaps, parity plots, ROC/PR curves, SHAP plots, atom contribution maps.
- **Browser feasibility:** ✅ Libraries up to ~1M molecules for similarity with precomputed fingerprints; ✅ QSAR up to ~50k compounds with classical ML.
- **Engines:** **RDKit.js** (BSD-3) in workers; Ketcher/Indigo WASM (Apache-2.0); WASM-R for fingerprint scans and Butina; PY for scikit-learn/XGBoost and RDKit-Python when RDKit.js lacks a function.
- **APIs:** ChEMBL (CC BY-SA 3.0: share-alike on redistributed derived datasets), PubChem PUG-REST (5 req/s), UniChem, OPSIN (name→structure; MIT), ZINC (check terms).
- **Limits:** 1M × 2048-bit fingerprints = 256 MB. Substructure on 1M is slow without a prefilter; with a prefilter it takes seconds. MCS is limited to small sets.
- **Cloud later:** GNN training, generative chemistry, large-scale docking screens, 3D conformer libraries and shape screening at scale, free-energy calculations.

---

## 3. What to build first (Milestone M1, the credible public launch)

Order is chosen by **number of users × browser fit × wow factor × engineering risk**.

1. **Foundation:** app shell, design system, project workspace, file handling, worker/engine runtime, job center, provenance, viz core.
2. **Sequence Studio (core):** largest audience; every biology student and wet lab needs it daily; low risk.
3. **Expression Studio (bulk DE):** the most common analysis that researchers struggle to do without R; tiny data, perfect browser fit; strong validation story against DESeq2.
4. **Structure Studio (core: viewer, features, interactions, comparison, pockets):** high visual impact; Mol* is mature; credible to pharma and structural biologists.
5. **Chemistry Studio (core: workspace, curation, properties, search, clustering):** RDKit.js is mature; relevant to India's large pharma/CRO sector.
6. **Atlas cards + Methods export:** small effort, strong signal of maturity.

## 4. What comes later

| Milestone | Items |
|---|---|
| **M2** | Alignment & Phylogenetics Studio; Variant Studio (germline + core annotation); Single-Cell Studio (scran.js core); QSAR Lab; Vina docking; Genome Studio (read QC, small-genome alignment, assembly QC, igv.js browsing) |
| **M3** | Variant Studio somatic and population modes; Genome Studio Regions & Tracks and microbial mode; Microbiome Studio; Spatial module; CRISPR design; ESM-2 in-browser models; proteomics in Expression Studio; batch correction and integration |
| **M4 (requires backend)** | Accounts and cloud projects; job execution on cloud/HPC (nf-core); GPU structure prediction; large-scale docking; GNN QSAR; collaborative workspaces; assistant/agent layer; MCP server |

## 5. Dependence on public APIs

| Studio | Essential? | APIs (all optional unless noted) | Fallback when unavailable |
|---|---|---|---|
| Sequence | No | NCBI E-utilities, ENA, EBI Job Dispatcher (BLAST, InterProScan) | Local file input; local MMseqs2/SW search |
| Alignment & Phylo | No | EBI Job Dispatcher (Clustal Omega, large MAFFT) | Local MAFFT/MUSCLE |
| Genome | Partly (reference genomes) | UCSC/Ensembl/NCBI genomes and annotations, AWS Open Data, ENA | User-supplied FASTA/GFF; cached reference packs |
| Variant | **Strongly for human annotation** | Ensembl VEP REST, MyVariant.info, ClinVar, gnomAD, CIViC, UniProt, Open Targets, cBioPortal | Local `bcftools csq`; cached annotation packs (licence-checked) |
| Expression | No (enrichment packs bundled) | g:Profiler, Enrichr, STRING, MyGene.info, GEO | Bundled GO/Reactome GMT and ID-mapping tables |
| Single-Cell & Spatial | No | CELLxGENE (public data), HPA | Local files |
| Microbiome | No | MGnify | Local files; hosted classifier packs |
| Structure | Partly (fetching structures) | RCSB, PDBe, AlphaFold DB, UniProt, InterPro, SIFTS | Local PDB/mmCIF upload |
| Chemistry | No (QSAR dataset fetch optional) | ChEMBL, PubChem, UniChem, OPSIN | Local files |

**API rules:**
- One typed client per service in `@wb/apis`.
- Token-bucket rate limiting per host, matching the published limits: NCBI 3 req/s without key or 10 with a user-supplied key; PubChem 5 req/s; Ensembl 15 req/s.
- Exponential backoff that honors `Retry-After`.
- Response cache in IndexedDB with TTL.
- Request deduplication.
- Consent prompt for any call that sends user data (sequences or variants).
- API keys are **user-supplied and stored locally**, never in the bundle. A server-held key goes through the edge proxy only.
- Every call is logged into provenance with service, endpoint, date and the database release where the API exposes it.

## 6. What requires future cloud/HPC

- **Primary NGS processing:** FASTQ→BAM/CRAM/VCF for human or large genomes (nf-core/sarek), FASTQ→counts at scale (nf-core/rnaseq), CellRanger/STARsolo (nf-core/scrnaseq), DADA2 (nf-core/ampliseq), shotgun metagenomics and MAGs (nf-core/mag), de novo assembly.
- **Large cohorts:** joint genotyping, LD, PRS, GWAS from genotypes (PLINK2 / REGENIE).
- **Atlas-scale single-cell** and deep-learning integration (scVI family on GPU); full-resolution Xenium/Visium HD; image segmentation.
- **Structure prediction** and complex modeling (Boltz-2, OpenFold3, Chai-1, ESMFold on GPU); MD and free-energy methods; generative protein design.
- **Virtual screening** of more than ~100 ligands; GNN-based QSAR training; generative chemistry.
- **Large homology searches** (BLAST/DIAMOND/MMseqs2 against UniRef/nr; Foldseek against AFDB).
- **Genome-wide CRISPR off-target** search for large genomes.

## 7. What should NOT be built

| Do not build | Reason |
|---|---|
| Standalone PCA / UMAP / heatmap / volcano / violin / Venn tools | They are components inside workflows (§2). A generic "upload CSV, get volcano" tool attracts low-value traffic and dilutes the product. A single "Quick Plot" escape hatch inside the Report builder is enough. |
| Dozens of single-purpose calculators (Tm, MW, molarity, reverse complement, codon table pages) as top-level tools | Put them in the command palette and inside Sequence Studio. |
| Human-scale read alignment, assembly or variant calling in the browser | Technically unrealistic (RAM, time), and users would lose hours to a crash. Route to cloud pipelines instead. |
| Full shotgun metagenomic classification with large DBs in the browser | Databases are tens of GB. |
| In-browser structure prediction or molecular dynamics | Requires GPU-class compute and GB-scale weights; the result would be a toy. |
| A clinical diagnostic tool, or automated ACMG classification sold as clinical | Regulatory exposure (CDSCO medical-device/IVD software rules, NABL/ICMR expectations, liability). Label everything **research use only**. A clinical product needs a separate validated, quality-managed track. |
| An unconstrained "biology chatbot" | Hallucination risk destroys trust. Build the assistant later on the typed job API, with every action inspectable. |
| Mirrors or scrapes of restricted databases (KEGG, COSMIC, OncoKB, DrugBank, OMIM, HGMD, DisGeNET) | Licence violations for a commercial entity. |
| A homegrown genome browser, 3D molecular viewer or molecule editor | igv.js, Mol* and Ketcher are best-in-class and permissively licensed. Build on them. |
| A generic workflow/pipeline builder (Galaxy clone) | Galaxy and Nextflow already own this. Our value is curated, validated workflows with excellent UX. |
| ELN/LIMS features | Different product category. |
| Separate mobile apps | Responsive viewing on tablets is enough. Serious analysis happens on laptops and desktops. |

---

## 8. Recommended technical architecture

### 8.1 High-level

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Browser (static SPA, PWA)                                                 │
│                                                                           │
│  App Shell (routing, layout, command palette, Atlas, Job Center, Reports) │
│     │                                                                     │
│     ├── Studios (lazy-loaded route bundles)                               │
│     │     Sequence · Phylo · Genome · Variant · Expression ·              │
│     │     SingleCell/Spatial · Microbiome · Structure · Chemistry         │
│     │                                                                     │
│     ├── @wb/bio-ui  (domain components: seq view, MSA, tree, igv, Mol*,   │
│     │                Ketcher, plasmid map, structure grid)                │
│     ├── @wb/viz     (chart system: Plot/SVG + WebGL + canvas heatmap)     │
│     ├── @wb/core    (data model, project store, provenance, tool registry)│
│     ├── @wb/io      (format sniffing, streaming parsers, writers)         │
│     ├── @wb/apis    (typed public-API clients, rate limit, cache)         │
│     └── @wb/compute (job queue, worker pool, engine adapters)             │
│               │                                                           │
│     ┌─────────┴───────────────────────────────────────────────┐           │
│     │ Workers: [wasm-cli] [rust-kernels] [pyodide] [duckdb]    │           │
│     │          [rdkit] [scran] [onnx/webgpu]                   │           │
│     └──────────────────────────────────────────────────────────┘           │
│  Storage: OPFS (files, results) · IndexedDB (metadata, cache) ·           │
│           Cache API via Service Worker (engines, reference packs)         │
└──────────────┬───────────────────────────────────────────────┬────────────┘
               │ (optional, consented)                          │ (future)
   Public APIs (EBI, NCBI, RCSB, UniProt,          Edge layer (Cloudflare Workers):
   Ensembl, ChEMBL, PubChem...)                     CORS proxy · cache · keys ·
   Reference packs (Cloudflare R2 /                  auth · job gateway
   Hugging Face datasets)                                       │
                                                   Job API (GA4GH WES/TES-compatible)
                                                                │
                                         Cloud batch / Kubernetes / GPU / institutional SLURM
                                         running Nextflow + nf-core + containerized tools
```

### 8.2 Frontend stack

| Concern | Choice | Notes |
|---|---|---|
| Language | TypeScript (strict) | Shared types between UI, workers and the future backend |
| Build | **Vite** | Fast; handles wasm and workers (`?worker`, `?url`) natively |
| UI framework | **React 19** | Ecosystem fit: Mol*, igv.js wrappers, Vitessce/Viv, Ketcher, Glide Data Grid, regl-scatterplot are all React-friendly |
| Routing | TanStack Router (type-safe, code-split routes) | Hash-free routing with an SPA fallback on Cloudflare Pages |
| State | **Zustand** (app/UI state) + **TanStack Query** (async/API state) | Plain, small, testable; avoids Redux overhead |
| Styling/UI kit | Tailwind CSS v4 + Radix UI primitives + our own `@wb/ui` (shadcn-style, owned code) | Full design control for a premium look; accessible primitives |
| Motion | Motion (formerly Framer Motion, MIT) | Tasteful transitions; respect `prefers-reduced-motion` |
| Data grid | **Glide Data Grid** (MIT, canvas, millions of rows) | Variant tables, DE tables, compound tables |
| Worker RPC | **Comlink** (Apache-2.0) | Typed proxy calls into workers |
| Validation | **Zod** | Tool parameter schemas → auto-generated forms + runtime validation |
| Monorepo | pnpm workspaces + Turborepo | Packages listed below |
| Tests | Vitest, Playwright (Chromium/Firefox/WebKit), fast-check | §Phase 8 |

### 8.3 Monorepo layout

```text
/apps
  /web                 # the single SPA (studios are lazy routes, not separate deployments)
  /docs                # docs + validation reports site (Astro or VitePress)
/packages
  /core                # data model, project store, provenance, tool registry, units
  /io                  # format sniffing, parsers, writers (wrapping @gmod/* where possible)
  /compute             # job queue, worker pool, engine adapters, resource estimation
  /apis                # public API clients
  /viz                 # chart system
  /bio-ui              # domain components
  /ui                  # design system (tokens, primitives, layout)
  /studio-sequence  /studio-phylo  /studio-genome  /studio-variant
  /studio-expression  /studio-singlecell  /studio-microbiome
  /studio-structure  /studio-chemistry
/engines
  /rust                # cargo workspace: wb-align, wb-stats, wb-intervals, wb-kmer,
                       #   wb-fingerprint, wb-ecology, wb-gsea, wb-interact, wb-vcf
  /emscripten          # build recipes for C/C++ tools (Dockerized, pinned versions)
  /manifests           # engine manifests (version, license, source URL, sha256, citation)
/reference-packs       # scripts that build versioned data packs (GO GMT, JASPAR, BUSCO lineages...)
/validation            # golden datasets, reference outputs, comparison notebooks
/edge                  # Cloudflare Worker (CORS proxy/cache) — optional
```

### 8.4 Core data model (`@wb/core`)

- **Project:** a local workspace holding datasets, analyses, figures, notes and a provenance log. Stored in OPFS with an IndexedDB index. Exportable as a zip in **RO-Crate** layout.
- **Dataset:** a typed handle (`SequenceSet`, `Alignment`, `Tree`, `ReadSet`, `AlignmentFile`, `IntervalSet`, `VariantTable`, `CountMatrix`, `SingleCellExperiment`, `FeatureTable`, `Structure`, `MoleculeTable`, `Model`) with a storage backend: in-memory Arrow, OPFS file, user `File` handle, or remote URL. Each carries a content hash, size, schema and origin.
- **Tool:** a declarative manifest registered in a tool registry:

```ts
export interface ToolManifest<P extends z.ZodTypeAny> {
  id: string;                         // "expression.deseq2"
  version: string;                    // tool wrapper version
  engine: EngineRef;                  // { id: "pyodide-pydeseq2", version: "0.4.x" }
  inputs: Record<string, DatasetType>;
  params: P;                          // zod schema → auto form + validation
  outputs: Record<string, DatasetType>;
  targets: Array<"browser" | "edge" | "cloud">;
  estimate(inputs: InputMeta, params: z.infer<P>): { memMB: number; seconds: number };
  citations: string[];                // CSL/BibTeX keys
  license: LicenseId;                 // checked against build policy
}
```

- **Job:** `{ id, toolId, params, inputRefs, target, status, progress, logs, outputs, provenance }`. Runs on any `target` through an `Executor` interface. The browser executor exists now; the cloud executor comes later (§11).
- **Provenance record:** tool + engine versions and build hashes, params, input hashes, API calls (endpoint, DB release, timestamp), browser/OS, duration. It renders as the Methods paragraph and as RO-Crate metadata.

### 8.5 Reusable scientific components (`@wb/bio-ui`)

| Component | Basis | Used by |
|---|---|---|
| `SequenceView` (linear, annotations, translations, virtualized) | Custom canvas (or SeqViz for maps) | Sequence, Genome, Structure |
| `PlasmidMap` (circular/linear) | SeqViz (MIT) or Open Vector Editor (MIT) evaluated in spike | Sequence |
| `ChromatogramView` | Custom canvas | Sequence |
| `MSAView` (virtualized 2D canvas, colour schemes, logo, conservation track) | Custom canvas (react-msaview as reference) | Phylo, Structure, Sequence |
| `TreeView` (rect/circular/unrooted, annotations, 50k tips) | Custom canvas/WebGL (phylotree.js for algorithms) | Phylo, Microbiome |
| `GenomeBrowser` | **igv.js** (MIT) wrapped as React component | Genome, Variant, Expression (gene view) |
| `MolViewer3D` | **Mol*** (MIT) | Structure, Chemistry (3D conformers), Variant (variant-on-structure) |
| `MolEditor` | **Ketcher** (Apache-2.0) | Chemistry, Structure (ligands) |
| `MolDepiction` / `StructureGrid` | RDKit.js SVG with thumbnail cache | Chemistry, QSAR, Structure |
| `DataGrid` | Glide Data Grid + structure/sparkline cell renderers | all |
| `EntityCard` (Atlas) | `@wb/apis` | all |
| `ParamForm` | Generated from Zod schemas with advanced/expert sections | all tools |
| `JobProgress` / `LogPanel` | Job store | all |

### 8.6 Reusable visualization system (`@wb/viz`)

A single chart layer with a consistent API, theme, export and linked selection.

- **Tier 1, statistical/publication charts:** **Observable Plot** (ISC) rendering SVG for bars, box/violin, scatter < 20k points, line, histograms, and volcano/MA up to ~60k genes (SVG with canvas fallback). Clean, exportable vector output.
- **Tier 2, large-point WebGL:** **regl-scatterplot** (MIT) for embeddings and chemical space (≥ 1M points, lasso selection), and **deck.gl** (MIT) for spatial omics layers.
- **Tier 3, custom canvas/WebGL renderers:** clustered heatmaps (with dendrograms; 10k × 1k cells), dot plots, oncoplots, Manhattan plots (millions of points via binning + WebGL), lollipops, coverage tracks.
- **Shared infrastructure:**
  - `ChartSpec` wrapper: data (Arrow), encodings, theme tokens (light/dark, colorblind-safe palettes such as viridis/cividis and Okabe-Ito).
  - **Selection bus:** cross-filter between charts and grids; a selection is a set of row IDs on a dataset.
  - **Export:** SVG (vector), PNG at 300/600 dpi, PDF (via svg2pdf.js, MIT). Every export embeds a provenance footnote option.
  - **Figure composer** in the Report builder: multi-panel layout, panel letters, consistent fonts, journal sizes.
- **Rejected:** Plotly as the core (heavy ~3.5 MB, generic look, hard to theme consistently). ECharts is acceptable for dashboards but unnecessary here.

### 8.7 File handling (`@wb/io`)

- **Input paths:**
  - Drag-and-drop and file picker.
  - **File System Access API** (Chromium) for folder access, e.g. a 10x MTX folder or a whole nf-core results directory.
  - Remote URLs (HTTP range requests; CORS required).
  - Accession fetch.
  - Paste.
- **No copying of large files:** pass the `File` object to workers (structured clone shares the underlying blob). WASM CLI tools mount files via Emscripten **WORKERFS**, which reads slices lazily.
- **Format sniffing by magic bytes, not extension:**
  - gzip `1f 8b`, BGZF (gzip + `BC` extra field)
  - BAM `BAM\1` after BGZF, CRAM `CRAM`
  - HDF5 `\x89HDF`, zip `PK`, BCF
  - Zarr (directory with `.zgroup`/`zarr.json`)
  - Then content heuristics for text formats.
- **Streaming parsers:**
  - Built on `file.stream()` plus native `DecompressionStream('gzip')` for plain gzip.
  - `@gmod/bgzf-filehandle` for random access to BGZF.
  - `@gmod/bam`, `@gmod/cram`, `@gmod/vcf`, `@gmod/tabix`, `@gmod/indexedfasta`, `@gmod/twobit`, `@gmod/bbi`, `@gmod/gff` (all MIT/Apache, maintained by the JBrowse team).
  - Our own Rust parsers where throughput matters (FASTQ stats, VCF→Arrow).
- **Tabular data:** Apache Arrow (JS) in memory; **DuckDB-WASM** (MIT) for SQL over large tables and for reading and writing Parquet/CSV/Excel-converted data.
- **Single-cell/HDF5:** `h5wasm` (check licence; NIST-derived permissive) for `.h5ad`/10x `.h5`; `zarrita.js` (MIT) for Zarr/SpatialData.
- **Writers:** FASTA, GenBank, GFF3, BED, VCF (htslib bgzip + tabix via WASM), Newick/NEXUS, SDF, CSV/TSV, Parquet, Excel (SheetJS CE is Apache-2.0; or `exceljs` MIT), h5ad (h5wasm).
- **Errors:** parsers report line/byte-offset errors with suggested fixes (e.g. "GTF detected, expected GFF3: convert?").

### 8.8 Local storage

| Store | Use | Notes |
|---|---|---|
| **OPFS** (Origin Private File System) | Project files, intermediate results, converted Parquet, cached reference packs | `createSyncAccessHandle()` in workers for fast I/O; supported in all modern browsers |
| **IndexedDB** (via Dexie, Apache-2.0) | Project index, job history, provenance, API response cache, settings | |
| **Cache API** (Service Worker, Workbox MIT) | App shell, WASM engines, Pyodide packages, reference packs | Versioned, offline-capable |
| `navigator.storage.persist()` | Requested when the user creates a project | Prevents eviction; show quota usage in Settings |
| localStorage | UI preferences only | Never data |

Data never syncs anywhere until a future, opt-in cloud account exists.

---

## 9. Recommended libraries & engines

### 9.1 Platform

| Library | Purpose | License |
|---|---|---|
| React, Vite, TanStack Router/Query/Virtual, Zustand, Zod, Comlink | App foundation | MIT / Apache-2.0 |
| Radix UI, Tailwind CSS, Motion | UI | MIT |
| Glide Data Grid | Big grids | MIT |
| Apache Arrow JS | Columnar memory | Apache-2.0 |
| DuckDB-WASM | SQL, Parquet | MIT |
| Dexie, Workbox | Storage, service worker | Apache-2.0 / MIT |
| Observable Plot, D3 | Charts | ISC |
| regl-scatterplot, deck.gl | WebGL viz | MIT |
| Cytoscape.js | Networks | MIT |
| svg2pdf.js / jsPDF | Export | MIT |
| Pyodide | Python runtime | MPL-2.0 (file-level copyleft; fine unmodified) |
| ONNX Runtime Web | ML inference (WebGPU/WASM) | MIT |
| coi-serviceworker | Cross-origin isolation fallback | MIT |

### 9.2 Bioinformatics I/O and viewers

| Library | Purpose | License |
|---|---|---|
| `@gmod/*` (bam, cram, vcf, tabix, bgzf-filehandle, indexedfasta, twobit, bbi, gff) | Genomic formats | MIT / Apache-2.0 |
| igv.js | Genome browser | MIT |
| Mol* | 3D structures | MIT |
| Ketcher (+ Indigo WASM) | Molecule editor | Apache-2.0 |
| SeqViz / Open Vector Editor | Plasmid maps | MIT |
| Nightingale (EBI) | Protein feature tracks | MIT |
| locuszoom.js | Regional association plots | MIT |
| Viv / Vitessce | Spatial images / multi-modal views | MIT |
| h5wasm, zarrita.js | HDF5, Zarr | permissive (verify h5wasm), MIT |
| Aioli / biowasm | Run C/C++ CLI tools in WASM workers | MIT (tools have their own licenses) |

### 9.3 Scientific engines

| Engine | Studio | License | Notes |
|---|---|---|---|
| htslib, samtools, bcftools | Genome, Variant | MIT/BSD | Build bcftools **without GSL** (GSL would make it GPL) |
| minimap2, miniprot | Genome | MIT | |
| fastp | Genome | MIT | |
| skani / sourmash | Genome | MIT / BSD-3 | |
| bedtools | Genome | MIT | Or our own Rust interval engine |
| MAFFT | Phylo | BSD | Compile ourselves |
| MUSCLE5 | Phylo | Public domain | |
| FastTree | Phylo | GPL-2 ⚠️ | Isolated module (§13) |
| IQ-TREE 2 | Phylo | GPL-2 ⚠️ | Isolated; experimental WASM |
| Primer3 | Sequence | GPL-2 ⚠️ | Isolated, or reimplement design search |
| MMseqs2 | Sequence | MIT (since v15; verify) | Local search |
| Prodigal | Genome | GPL-3 ⚠️ | Isolated |
| HMMER | Structure/Genome | BSD-3 | Small HMM sets only locally |
| scran.js / bakana (kanaverse) | Single-cell | MIT | Core engine |
| PyDESeq2 | Expression | MIT | Pyodide |
| scikit-learn, XGBoost, NumPy, SciPy, pandas | Expression, QSAR | BSD / Apache-2.0 | Pyodide packages |
| RDKit.js (and RDKit in Pyodide) | Chemistry, Structure | BSD-3 | |
| OPSIN | Chemistry | MIT | Java: use EBI web service or a JS port; verify |
| DSSP (mkdssp 4) | Structure | BSD-2 | |
| FreeSASA | Structure | MIT | |
| fpocket | Structure | MIT | |
| TM-align / US-align | Structure | Permissive custom (verify) | |
| AutoDock Vina (Webina approach) | Structure | Apache-2.0 | |
| Gemmi | Structure (mmCIF I/O, utilities) | MPL-2.0 | WASM build available |
| ESM-2 (8M–150M) | Structure | MIT | ONNX export |
| Nextclade | Genome (viral) | MIT | Link-out or embed |
| Custom Rust kernels (`/engines/rust`) | all | Ours (Apache-2.0 if open-cored) | SW/NW alignment, distances, NJ, intervals, k-mers, PWM, UniFrac, PERMANOVA, GSEA, NNLS, fingerprint scans, Butina, interaction profiler, VCF→Arrow, kinship, Moran's I |

---

## 10. Browser / WebAssembly / Web Worker strategy

### 10.1 Decision rules: where code runs

| Workload | Run as |
|---|---|
| UI, layout, small transforms (< 16 ms) | Main thread JS |
| Parsing, stats, anything ≥ 16 ms or proportional to file size | Web Worker (TS) |
| Hot numeric kernels we own (alignment, distances, graph algorithms, fingerprint scans, permutation tests) | **Rust → WASM** in a worker (SIMD enabled) |
| Established C/C++ scientific tools (htslib, minimap2, MAFFT, Vina, fpocket, DSSP) | **Emscripten WASM** in a worker, unmodified where possible, through a CLI adapter (Aioli-style, WORKERFS mounts) |
| Algorithms whose reference implementation is Python and porting is costly (PyDESeq2, scikit-learn models) | **Pyodide** in a dedicated worker, lazy-loaded |
| SQL over large tables | **DuckDB-WASM** worker |
| Neural-network inference | **ONNX Runtime Web** in a worker (WebGPU, falling back to WASM SIMD) |
| GPU-parallel numeric work (optional acceleration) | WebGPU compute shaders behind a feature flag with a CPU fallback |

**Why Rust for our own kernels:** memory safety, excellent `wasm-bindgen` tooling, SIMD (`core::arch::wasm32`), reuse of the same crates natively in the future backend (one implementation for browser and server), and a growing bioinformatics crate ecosystem (`noodles` for formats, MIT). AssemblyScript was rejected (immature numerics). Raw C++ is rejected for new code because of safety and maintainability.

### 10.2 Worker runtime (`@wb/compute`)

- **Engine workers:** one module worker type per engine family (`wasm-cli`, `rust`, `pyodide`, `duckdb`, `rdkit`, `scran`, `onnx`). Engines load lazily on first use and are cached by the service worker.
- **Pool:** size = `min(hardwareConcurrency − 1, memoryBudget / perWorkerEstimate)`. Pyodide and DuckDB are singletons (heavy). Parallelizable jobs (bootstrap replicates, permutations, chunked FASTQ stats, docking batch) fan out across the pool.
- **Cancellation:** cooperative (AbortSignal checked in kernels), plus hard cancel by `worker.terminate()` and respawn. WASM tools cannot be interrupted otherwise.
- **Progress:** kernels report progress through a callback/MessagePort. CLI tools have their stderr parsed for progress patterns.
- **Memory safety net:**
  - Each tool's `estimate()` runs before execution, compared with a budget derived from `navigator.deviceMemory` (coarse) and the per-instance wasm cap.
  - Over budget, the UI offers downsampling, filtering, chunked mode, or "run in cloud" once the backend exists.
  - Catch `RangeError`/OOM and surface it as a recoverable error with guidance.
- **Data transfer:** Transferable `ArrayBuffer`s (zero-copy moves); Arrow IPC between workers; `SharedArrayBuffer` only when `crossOriginIsolated`.
- **Threads:** build each C/C++ engine in two flavours where useful: single-threaded (default, works everywhere) and pthreads (loaded only when `crossOriginIsolated && SharedArrayBuffer`). Production on Cloudflare Pages sets `COOP: same-origin` and `COEP: credentialless`. `credentialless` keeps cross-origin public API fetches working without CORP headers; verify current Safari support and fall back to single-thread where absent.
- **Job persistence:** jobs survive route changes, not page reloads. Results are written to OPFS as they complete. Warn on `beforeunload` while jobs run. Long jobs checkpoint where the engine allows (e.g. bootstrap replicates).

### 10.3 Bundle and loading budget

- App shell ≤ 250 KB gzipped JS; each studio route ≤ 500 KB gzipped (excluding engines).
- Engines load on demand with a visible progress bar and size:
  - RDKit.js ~ 6–8 MB
  - Mol* ~ 3–5 MB
  - Pyodide core ~ 10 MB + packages (scipy ~ 30 MB)
  - DuckDB-WASM ~ 6–8 MB
  - Most CLI tools 0.3–3 MB
- Large artifacts (Pyodide packages, reference packs) come from **CDN/object storage**, not the Pages bundle: Cloudflare Pages has a **25 MiB per-file limit**; GitHub Pages 100 MB.
- Reference packs live on **Cloudflare R2** (free tier 10 GB, zero egress) or **Hugging Face Hub datasets** (free, CORS-enabled). Each pack is versioned, checksummed, licence-tagged and cached in OPFS. GitHub Release assets are **not** a valid option because they lack reliable CORS.
- Pin and self-host engine builds (no runtime fetching from third-party CDNs for executable code), or use Subresource Integrity where self-hosting is impossible.

### 10.4 Browser support policy

- **Supported:** last 2 versions of Chrome/Edge, Firefox and Safari (desktop). Tablets for viewing.
- **Feature detection, not UA sniffing:** WebGPU, File System Access, `crossOriginIsolated`, OPFS sync handles, memory64. A "System capabilities" panel tells users what their browser can do.
- Mobile phones: viewing and reports only, with a clear message.

### 10.5 GitHub Pages limitations, and the resolution

| Limitation | Impact | Resolution |
|---|---|---|
| No custom headers (COOP/COEP/CSP/cache control) | No WASM threads; weaker CSP | Production on Cloudflare Pages with `_headers`; `coi-serviceworker` fallback on GH Pages |
| ToS: not for commercial SaaS / online business | Compliance risk for a company | GH Pages only for docs/previews; production on Cloudflare Pages (or Netlify/Vercel free tiers) |
| 1 GB site, 100 MB file, ~100 GB/month bandwidth (soft) | Engines and reference data cannot live there | CDN + R2/HF for large assets |
| No server-side SPA routing | Deep links 404 | Cloudflare Pages SPA fallback (or `404.html` trick on GH Pages) |
| No server code | No CORS proxy, keys, auth | Cloudflare Worker (free tier) when needed |
| 10 builds/hour | CI limits | Build in GitHub Actions, deploy artifacts |

---

## 11. Future backend architecture

Designed now, built later. The frontend never needs a rewrite because the **Executor** and **Storage** interfaces already exist in `@wb/compute` and `@wb/core`.

### Stage 0: static (now)
Static SPA, local compute, public APIs, reference packs on object storage.

### Stage 1: edge layer (when needed; still ~₹0)
**Cloudflare Workers** handle:
- CORS proxy for an allow-list of scientific APIs (never an open proxy);
- response caching (KV/Cache API);
- server-side API keys (e.g. NCBI key) with per-IP rate limiting;
- privacy-preserving, opt-in, aggregate usage metrics (no third-party analytics scripts);
- feature flags and an engine-version manifest.

### Stage 2: accounts & cloud projects
- **Auth:** Supabase Auth or Cloudflare Access/Clerk. Prefer an open, self-hostable option such as Supabase (Apache-2.0) for portability and Indian data residency.
- **Metadata DB:** Postgres (Supabase or managed Postgres in an Indian region).
- **Object storage:** S3-compatible (R2, or S3 in ap-south-1/ap-south-2). Uploads go via pre-signed URLs straight from the browser, never through app servers. Optional **client-side encryption** of project files before upload, with keys held by the user/org.
- **Sync model:** projects remain local-first. Cloud is a sync target. Provenance and RO-Crate structure are identical locally and remotely.

### Stage 3: compute (cloud / GPU / HPC)

```text
Browser ── Job spec (same ToolManifest + params + input DRS URIs) ──▶ Job Gateway (API)
                                                                       │
                                     ┌─────────────────────────────────┼──────────────────────────┐
                                     ▼                                 ▼                          ▼
                             Workflow jobs                    Single-tool jobs              GPU inference
                       (Nextflow + nf-core pipelines,     (containerized tool on         (Boltz-2/OpenFold3,
                        WES-compatible API)                AWS Batch/GCP Batch/K8s,       ESM, Chemprop,
                                     │                     TES-compatible API)            docking batches)
                                     ▼                                 ▼                  on serverless GPU
                       Executors: AWS Batch · Google Batch · Kubernetes · SLURM (institutional HPC via
                       Nextflow's slurm executor or a TES server such as Funnel) · on-prem
                                     │
                                     ▼
                 Outputs (standard formats) → object storage → imported into the same Studio viewers
```

- **Standards:** GA4GH **WES** (workflow execution), **TES** (task execution), **DRS** (data object URIs), **htsget** (streaming reads/variants to igv.js), **refget** (reference sequences), **VRS** (variant representation in annotation caches). Adopting them makes institutional HPC and partner clouds pluggable.
- **Pipelines:** use **nf-core** pipelines (MIT; Nextflow Apache-2.0) instead of writing our own: rnaseq, sarek, scrnaseq, ampliseq, mag, viralrecon, taxprofiler, proteinfold. The studios already import their outputs (built in M1–M3), so the cloud stage is mostly orchestration.
- **Containers:** pinned images (BioContainers/Seqera containers), SBOMs, image signing.
- **GPU:** serverless GPU providers for bursty inference/prediction, with on-demand GPU instances in Indian regions for data-residency customers.
- **Same Rust kernels natively:** the `/engines/rust` crates compile to native binaries for server-side batch use. One implementation, validated once.
- **Hybrid execution routing:** the job planner reads `estimate()`. Small jobs run in the browser, medium ones run in the browser with a warning, large ones are suggested for cloud. The user always chooses, and the planner never uploads silently.
- **Agent/MCP layer (future):** the job API doubles as an MCP tool surface. Each tool manifest becomes a typed MCP tool, so AI assistants inside or outside the platform can run validated analyses with full provenance.

---

## 12. Privacy, security & performance

### Privacy
- **Local by default:** no file content leaves the device unless the user triggers a consented external call. Consent dialogs show exactly what is sent and to whom, plus the provider's terms link. A per-project "external calls" log is kept.
- **Human genetic data:** warning banners when VCF/BAM with human samples are loaded; no identifiers in URLs; no sample names in telemetry; "clear project data" securely removes OPFS/IndexedDB entries.
- **Telemetry:** off by default, opt-in, aggregate-only (feature usage counts, errors without data), served via our own edge endpoint. No Google Analytics or third-party trackers. This is part of the trust story.
- **Compliance posture:** DPDP Act 2023 (India). Local-first means we are not a data fiduciary for analysis data in Stage 0–1. Document this. Prepare GDPR/HIPAA-aware design for the future cloud.
- **Research use only** labeling on Variant Studio and any clinical-adjacent output.

### Security
- Strict **CSP** via headers (Cloudflare): `script-src 'self' 'wasm-unsafe-eval'` plus explicit hashes; an allow-listed `connect-src` for the API hosts; `worker-src 'self' blob:`.
- No `eval` outside WASM compilation. Pyodide runs only our own bundled code; user-supplied code execution is not a feature.
- Sanitize all rendered external content (gene descriptions, API HTML) with DOMPurify (Apache-2.0/MPL-2.0).
- Dependency hygiene: lockfiles, Renovate, `npm audit`/OSV scanning in CI, SBOM generation, reproducible Emscripten/Rust builds in pinned Docker images with checksums recorded in engine manifests.

### Performance
- Performance budgets enforced in CI (bundle size, Lighthouse, cold-load of each studio).
- Streaming everywhere: parsers never require full file materialization unless the format demands it.
- Virtualization for all long lists, grids, MSAs and trees.
- WebGL for > 20k marks; canvas for heatmaps; SVG only for publication-size charts.
- Progressive results (e.g. FASTQ QC updates live while streaming).
- Precompute and cache derived data (fingerprints, Parquet conversions, embeddings) in OPFS keyed by input hash.
- Benchmarks per engine on reference hardware (8 GB laptop, 16 GB desktop), published alongside validation.

---

## 13. Licensing considerations

### 13.1 Software licence policy

| Category | Examples | Policy |
|---|---|---|
| **Permissive** (MIT, BSD, Apache-2.0, ISC, public domain) | React, Mol*, igv.js, RDKit, Ketcher, htslib/samtools/bcftools, minimap2, MAFFT, MUSCLE5, Vina, fpocket, DSSP, FreeSASA, scran.js, PyDESeq2, DuckDB, ONNX Runtime | ✅ Use freely; keep attribution in `/licenses` page and NOTICE files |
| **Weak copyleft** (MPL-2.0, LGPL) | Pyodide (MPL), Gemmi (MPL), DOMPurify (dual), BEAST (LGPL; cloud), DESeq2 (LGPL; validation only) | ✅ Use unmodified; publish modifications to those files/libraries; dynamic loading only |
| **Strong copyleft** (GPL-2/3) | FastTree, IQ-TREE, Primer3, Prodigal, Clustal Omega, trimAl, PLIP, Open Babel, HMMER2-era tools, R itself (webR), bowtie2, BWA, SPAdes, Bakta | ⚠️ **Browser:** shipping WASM to users counts as *distribution*. Only as **separately loaded, unmodified (or publicly patched) modules**, never linked into our own bundles or Rust crates, with full source and licence offered. **Server:** fine to run (no distribution), but keep modifications public anyway. **Preferred:** reimplement small algorithms (trimAl-like trimming, PLIP-like interaction rules, NJ) or call the public web service (Clustal Omega via EBI). **Get legal review before commercial launch.** |
| **Network copyleft** (AGPL-3) | RAxML-NG | ⚠️ Server use with modifications triggers source obligations; avoid modification or avoid entirely |
| **Non-commercial / restricted** | MEME Suite, AlphaFold 3 weights, ESM3-open and ESM C 600M weights (verify current terms), SpliceAI precomputed scores, CADD, NetMHC/SignalP/TMHMM (DTU academic licences), DIA-NN (verify), ChimeraX | ❌ Do not ship or integrate in commercial builds. Link out only, or license commercially. |

**Enforcement:** every engine manifest and reference pack carries an SPDX licence ID and a `commercialUse: allowed | conditional | prohibited` flag. A CI check fails the production build if a `prohibited` item is reachable, or if a GPL item is imported by a non-isolated module.

### 13.2 Data/database licence policy

| Source | Licence (verify at integration time) | Implication |
|---|---|---|
| PDB, ClinVar, dbSNP, NCBI RefSeq/GenBank, PubChem (most), AMRFinderPlus DB, CIViC, gnomAD | Public domain / CC0 / open | ✅ |
| UniProt, AlphaFold DB, GO, Reactome, STRING, JASPAR, Ensembl | CC BY 4.0 / free with attribution | ✅ Attribution in UI and Methods export |
| ChEMBL, Human Protein Atlas, GTDB | CC BY-SA | ⚠️ Share-alike applies to redistributed **derived databases** (e.g. a bundled pack built from ChEMBL). Displaying API results is fine; bundled derivatives must remain CC BY-SA. Models trained on them: get legal opinion. |
| MSigDB | Mostly CC BY 4.0 since 2023, with exceptions for some collections | ⚠️ Per-collection check; exclude restricted ones |
| AlphaMissense | CC BY 4.0 (changed from NC; verify) | ✅ if confirmed |
| KEGG, COSMIC, OncoKB, DrugBank, OMIM, HGMD, DisGeNET, dbNSFP (academic version), CADD, REBASE (verify) | Commercial licence required | ❌ No integration in commercial builds without a licence. Use open alternatives: Reactome/GO for pathways, CIViC for cancer actionability, ClinVar for clinical significance. |
| SILVA | Verify current licence (historically restricted for commercial use) | Prefer Greengenes2 (BSD) / GTDB |
| Ensembl VEP REST, NCBI, EBI services | Free, but subject to fair-use terms | ✅ Respect rate limits; identify the tool via `tool`/`email` parameters where requested (an org email, not personal) |

### 13.3 Our own code
Recommended: **Apache-2.0** for the open-core packages (`io`, `compute`, `viz`, `bio-ui`, Rust kernels), because it includes a patent grant and is commercially friendly. The cloud/enterprise layer stays proprietary. Include `CITATION.cff`, a `/licenses` page generated from the SBOM, and a "How to cite" for every tool used in an analysis.

---

## 14. Implementation Tasks

Milestone tags: **[M1]** public launch · **[M2]** second wave · **[M3]** third wave · **[M4]** requires backend.
Each task should be its own PR with tests. "DoD" = definition of done.

### Phase 0 — Technical spikes (de-risk before committing; ~2 weeks)
- [ ] [M1] Spike: run **scran.js/bakana** on a 50k-cell 10x `.h5` in a worker. Record peak memory and time on an 8 GB laptop and a 16 GB desktop. DoD: report in `/validation/spikes/singlecell.md`.
- [ ] [M1] Spike: run **PyDESeq2** in Pyodide in a worker on the `pasilla` dataset. Compare log2FC and padj with R DESeq2 (same design). Record load time and fit time. DoD: Pearson r of log2FC ≥ 0.999 documented, or a decision to use the native engine.
- [ ] [M1] Spike: compile **MAFFT**, **MUSCLE5** and **minimap2** with Emscripten (single-thread + pthreads) in a pinned Docker image. Run each in a worker via a WORKERFS-mounted `File`. DoD: build recipe in `/engines/emscripten/<tool>/`, timings for 3 input sizes.
- [ ] [M1] Spike: **AutoDock Vina** WASM (Webina-style) docking a known ligand into 1HSG/PDB example. Compare pose RMSD and score with native Vina.
- [ ] [M1] Spike: DuckDB-WASM ingesting a 5M-line VCF converted to Parquet via a Rust VCF→Arrow kernel. Record memory and query latency for typical filters.
- [ ] [M1] Spike: Cloudflare Pages deployment with `COOP: same-origin` + `COEP: credentialless`. Verify `crossOriginIsolated === true` in Chrome/Firefox/Safari, and that fetches to RCSB, UniProt, EBI, NCBI and Ensembl still succeed. Document Safari behavior and fallback.
- [ ] [M1] Spike: RDKit.js in a worker computing Morgan fingerprints for 100k SMILES, plus a Rust popcount Tanimoto scan. Record throughput.
- [ ] [M1] Write `/docs/adr/` Architecture Decision Records for: hosting (Cloudflare Pages), React/Vite, Rust kernels, Pyodide scope, viz tiers, licence policy.

### Phase 1 — Foundation
- [ ] [M1] Create the pnpm + Turborepo monorepo with the layout in §8.3. Shared `tsconfig` (strict), ESLint (typescript-eslint), Prettier, Vitest, Playwright. CI on GitHub Actions running lint, typecheck, test and build on every PR.
- [ ] [M1] Deployment: GitHub Actions builds `apps/web` and deploys to Cloudflare Pages (production on `main`, preview per PR). Add `_headers` with COOP/COEP/CSP/cache rules and `_redirects` with the SPA fallback. Add `coi-serviceworker` fallback when headers are absent.
- [ ] [M1] `@wb/ui` design system:
  - Tokens: color (light/dark), spacing, radius, typography (variable font such as Inter + JetBrains Mono, self-hosted), elevation, motion durations.
  - Radix-based primitives: Button, Input, Select, Dialog, Popover, Tabs, Tooltip, Toast, Menu, Slider, Switch, Splitter/ResizablePanels.
  - Ladle/Storybook catalogue. DoD: every primitive has light/dark stories and axe-clean accessibility tests.
- [ ] [M1] App shell: top bar (project switcher, global search/Atlas, Job Center indicator, network badge), left studio navigator, resizable workspace panels, status bar (memory/engines). Command palette (`Cmd/Ctrl+K`) with a registry API where studios register commands and utilities.
- [ ] [M1] Routing with TanStack Router. Each studio is a lazy route chunk. Prefetch on hover. Route-level error boundaries with a "report issue" payload that contains no user data.
- [ ] [M1] `@wb/core` data model: TypeScript types and Zod schemas for `Project`, `Dataset` (all types in §8.4), `ToolManifest`, `Job`, `ProvenanceRecord`. Unit tests for schema validation.
- [ ] [M1] Project store: create/open/rename/delete projects. Datasets stored in OPFS (`/projects/<id>/data/<hash>`), index in IndexedDB via Dexie. `navigator.storage.persist()` request; quota display. DoD: a project with 3 datasets survives reload; delete removes all OPFS files.
- [ ] [M1] Project export/import as zip in **RO-Crate** layout (`ro-crate-metadata.json` with datasets, tools, parameters and provenance). Round-trip test.
- [ ] [M1] `@wb/io` sniffing: magic-byte + heuristic detection for all formats in §8.7, with tests on fixture files (including misnamed extensions).
- [ ] [M1] `@wb/io` file intake UI: drag-and-drop zone, file picker, folder picker (File System Access API with fallback), URL input (HEAD check for range support and CORS with clear error messages), paste box. Datasets register into the project with type detection and confirmation.
- [ ] [M1] `@wb/io` parsers v1: FASTA, FASTQ (streaming, gz), GenBank/EMBL, GFF3/GTF, BED, Newick, CSV/TSV/Excel (via SheetJS CE or exceljs), SDF/SMILES (delegating to RDKit worker). Each parser streams, reports byte/line on error, and has fuzz/property tests (fast-check).
- [ ] [M1] `@wb/compute` worker runtime:
  - Engine registry and lazy engine loader with download progress.
  - Worker pool with sizing rules (§10.2).
  - Comlink RPC, AbortSignal cooperative cancel plus hard terminate/respawn.
  - Progress channel, log capture.
  - DoD: a demo Rust kernel and a demo WASM CLI tool run in parallel and can be cancelled.
- [ ] [M1] `@wb/compute` WASM CLI adapter: run an Emscripten tool with argv, WORKERFS mounts for input `File`s, MEMFS/OPFS outputs, stdout/stderr streaming, exit codes. Use Aioli (MIT), or write an equivalent thin adapter if Aioli does not fit the build pipeline.
- [ ] [M1] Rust engine workspace `/engines/rust` with `wasm-pack` builds (SIMD enabled, `wasm-opt -O3`), a TS bindings package, and CI that builds and tests natively and in wasm (`wasm-bindgen-test`).
- [ ] [M1] Pyodide engine worker: lazy load from self-hosted/CDN mirror with SRI; package preloading per tool; Python↔Arrow transfer helper (`pyarrow`, if available in Pyodide; else NumPy buffers); idle-unload after N minutes to free memory.
- [ ] [M1] DuckDB-WASM engine worker with helpers: register OPFS Parquet/CSV, run query → Arrow, cancel query.
- [ ] [M1] Job system:
  - Job store (Zustand + IndexedDB persistence of job history), Job Center panel (queue, running, done, failed; logs; re-run with same params; open outputs).
  - `estimate()` gate with over-budget dialog.
  - `beforeunload` warning while jobs run.
- [ ] [M1] Provenance: every job writes a `ProvenanceRecord`. Methods generator converts a project's provenance into a Methods paragraph (templated per tool) plus BibTeX. Each tool manifest carries citation metadata in CSL-JSON.
- [ ] [M1] `ParamForm`: auto-generate parameter forms from Zod schemas with sections (basic/advanced), help text, units, validation messages and presets.
- [ ] [M1] `@wb/viz` core:
  - `ChartSpec` + theme tokens.
  - Observable Plot wrapper.
  - regl-scatterplot wrapper with lasso.
  - Canvas heatmap renderer (with row/column dendrogram slots).
  - Selection bus.
  - Export to SVG/PNG (dpi option)/PDF.
  - DoD: Storybook stories with 1k/100k/1M point datasets; visual regression snapshots.
- [ ] [M1] `DataGrid` (Glide Data Grid) wrapper: Arrow-backed, sort/filter, column types (number with formatting, gene link, structure thumbnail, sparkline, badge), CSV/Excel export, row selection on the selection bus.
- [ ] [M1] `@wb/apis` framework: base client with per-host token-bucket limiter, retry/backoff (`Retry-After`), IndexedDB cache with TTL, request dedupe, consent hook for payload-bearing calls, provenance logging. Clients v1: UniProt, RCSB (data + search), AlphaFold DB, NCBI E-utilities, ENA, Ensembl REST, PubChem, ChEMBL, EBI Job Dispatcher (submit/poll/result).
- [ ] [M1] Atlas: global search box resolving gene symbols, UniProt accessions, PDB IDs, rsIDs/HGVS, ChEMBL IDs, compound names. `EntityCard` components for Gene, Protein, Structure, Variant and Compound, with cross-studio "Open in…" actions.
- [ ] [M1] Settings: theme, user-supplied API keys (stored in IndexedDB, never exported in projects), telemetry opt-in (default off), storage management, System capabilities panel (WebGPU, crossOriginIsolated, OPFS, File System Access, memory estimate).
- [ ] [M1] Service worker (Workbox): precache shell, runtime-cache engines and reference packs with versioned keys, offline fallback page. DoD: after one visit, Sequence Studio works offline.
- [ ] [M1] Reference pack system: `/reference-packs` build scripts produce versioned, checksummed `.tar.zst` or Parquet packs with `pack.json` (name, version, source, licence SPDX, commercialUse flag, citation). Upload to R2/HF. Loader verifies the checksum and caches in OPFS.
- [ ] [M1] Licence registry & CI check: engine/pack manifests include SPDX and `commercialUse`. Script fails the build on prohibited items or GPL items imported outside isolated engine modules. Generate a `/licenses` page from the SBOM (CycloneDX) at build time.
- [ ] [M1] Example datasets registry: each studio declares demo datasets (public, licence-checked, with citation) loadable in one click.
- [ ] [M2] Report builder: compose figures (multi-panel layout, panel letters), tables, text and Methods into an HTML report. Export HTML (self-contained) and PDF.
- [ ] [M2] Edge proxy (`/edge`): Cloudflare Worker with an allow-listed upstream map, CORS headers, cache, per-IP rate limit, optional server-held NCBI key. Feature-flagged in the frontend; the app must work without it.

### Phase 2 — Sequence (Sequence Studio + Alignment & Phylogenetics Studio)
- [ ] [M1] Sequence model: `SequenceRecord` (alphabet, topology, features with qualifiers, translations), conversion to and from GenBank/FASTA/EMBL, edit operations with undo/redo history (command pattern).
- [ ] [M1] `SequenceView`: virtualized linear view with ruler, features, six-frame translation tracks, selection with live stats (length, GC, Tm, MW), find (exact/IUPAC/regex), copy as FASTA/rev-comp.
- [ ] [M1] `PlasmidMap`: evaluate SeqViz vs Open Vector Editor (licence, bundle size, customization) and implement a circular/linear map with features, restriction sites and primers, synchronized with `SequenceView`.
- [ ] [M1] Sequence core analyses (Rust kernels + UI panels): composition/GC windows, codon usage, ORF finder (all genetic codes, min length, nested ORFs), translation, protein properties (MW, pI, extinction coefficient, GRAVY, instability index).
- [ ] [M1] Restriction analysis: enzyme database (compiled from openly licensed sources; document provenance), commercial-availability filters, single/double digests, virtual gel (agarose ladder simulation).
- [ ] [M1] Tm engine: SantaLucia 1998 nearest-neighbor with Owczarzy 2004/2008 salt and Mg²⁺ correction, primer concentration. Validate against published values and Primer3 `oligotm`.
- [ ] [M1] Primer design: Primer3 WASM as an isolated GPL module with a wrapper exposing PCR primers, qPCR (with probe), sequencing primers and target/excluded regions. Primer table with dimer/hairpin checks; primers rendered on the map.
- [ ] [M1] In-silico PCR against loaded sequences (Rust, mismatch-tolerant 3′-weighted matching). Product list and virtual gel.
- [ ] [M1] Pairwise alignment (Rust: NW/SW/semi-global, affine gaps, BLOSUM/PAM/DNA matrices, SIMD striped SW), alignment view, identity/similarity stats, dotplot (Rust k-mer dotplot with canvas render).
- [ ] [M1] Sanger module: AB1/SCF parser, chromatogram viewer, Mott quality trimming, align reads to a reference, discrepancy list.
- [ ] [M1] Cloning simulator: restriction/ligation, Gibson/HiFi (overlap design + assembly), Golden Gate (BsaI/BsmBI/Esp3I), Gateway (att sites). Product preview, history of construct lineage, export GenBank.
- [ ] [M1] Accession fetch (NCBI nuccore/protein, ENA, UniProt) into `SequenceRecord` with features.
- [ ] [M1] Remote BLAST via EBI Job Dispatcher (blastn/blastp/blastx; DB choice), with consent dialog, polling and a results table + alignment view linking hits to Atlas.
- [ ] [M2] Local similarity search: MMseqs2 WASM (verify MIT licence version) with createdb/search on user FASTA DBs stored in OPFS, falling back to Rust SIMD SW for tiny DBs. Hits table.
- [ ] [M2] Plasmid feature auto-annotation from a curated, openly licensed feature library (Rust exact/approximate matching).
- [ ] [M3] CRISPR guide design: PAM scanning (SpCas9, SaCas9, Cas12a), on-target scoring with a permissively licensed model (document the model licence), local off-target search in loaded sequences/small genomes (Rust, ≤ 4 mismatches), guide table with filters.
- [ ] [M3] Codon optimization: host tables computed from Ensembl/NCBI CDS sets (build script in `/reference-packs`), CAI/tAI, avoid restriction sites/repeats/GC extremes.
- [ ] [M2] MSA engines: MAFFT (BSD) and MUSCLE5 (public domain) WASM tools with manifests; Clustal Omega via EBI Job Dispatcher client.
- [ ] [M2] `MSAView`: virtualized canvas, color schemes (ClustalX, Zappo, Taylor, hydrophobicity, % identity), consensus and conservation tracks, sequence logo, column selection, sequence reorder/filter, editing (gap insert/delete), export.
- [ ] [M2] Alignment curation (Rust): gap-threshold trimming, gappyout/strict-style heuristics reimplemented from the published trimAl criteria (clean-room), sequence-identity filtering, redundancy reduction.
- [ ] [M2] Conservation analyses (Rust): Shannon entropy, Jensen-Shannon divergence, identity matrix; export per-column table linkable to Structure Studio.
- [ ] [M2] Distances and fast trees (Rust): p, JC69, K2P, TN93 (DNA), Poisson/JTT-like (protein, approximate); NJ, BIONJ, UPGMA. Test against reference implementations (e.g. ape/scikit-bio outputs).
- [ ] [M2] ML tree: FastTree WASM (isolated GPL module) with SH-like support; IQ-TREE 2 WASM behind an "experimental" flag (model selection for small alignments); bootstrap replicates parallelized across the worker pool.
- [ ] [M2] `TreeView`: rectangular/circular/unrooted layouts, canvas/WebGL rendering up to 50k tips, collapse/expand, reroot (midpoint/outgroup), ladderize, search, metadata-driven tip colors, strips and heatmap columns, scale bar, export SVG/PDF.
- [ ] [M2] Tree tools: Robinson-Foulds distance, tanglegram, prune/extract subtree, Newick/NEXUS/NHX I/O.
- [ ] [M3] Root-to-tip regression with tip dates; TreeTime in Pyodide spike → time-scaled tree if viable.

### Phase 3 — Genomics (Genome Studio, Variant Studio, Microbiome Studio)
- [ ] [M2] Genome registry: reference genome definitions (FASTA/2bit URL, index, annotations, cytobands) for common organisms (human GRCh38/T2T-CHM13, mouse, zebrafish, fly, worm, yeast, Arabidopsis, rice, E. coli, M. tuberculosis H37Rv, SARS-CoV-2), using igv.js-hosted genome JSONs or our own R2-hosted indexed files. Support user-provided genomes.
- [ ] [M2] `GenomeBrowser` (igv.js React wrapper): add tracks from project datasets or URLs, locus navigation, linking to the selection bus (click gene → Atlas), session save/load in the project.
- [ ] [M2] Read QC (Rust streaming kernel, chunked across workers): per-position quality, length distribution, GC distribution, N content, duplication estimate (sampling), adapter detection (known adapter k-mers), overrepresented sequences. Live-updating report. DoD: 5 GB FASTQ.gz processed without exceeding 500 MB memory.
- [ ] [M2] fastp WASM integration (trimming/filtering) with outputs written to OPFS and the fastp JSON report parsed into native charts.
- [ ] [M2] Small-genome alignment: minimap2 WASM (presets: map-ont, map-hifi, sr, asm5/asm20) → samtools sort/index (WASM) → BAM in OPFS → browser tracks. Guard: reference ≤ 100 Mb via `estimate()`.
- [ ] [M2] BAM/CRAM statistics: samtools flagstat/stats/depth/coverage via WASM for local files; coverage plots, insert size, MAPQ, per-contig coverage table.
- [ ] [M2] Consensus calling for viral/bacterial references (samtools consensus WASM), plus low-coverage masking parameters.
- [ ] [M2] Assembly QC (Rust): N50/NG50/L50/auN, contig length histogram and cumulative plot, GC distribution, GC-vs-coverage blob plot when reads or coverage are supplied, per-contig table.
- [ ] [M2] Completeness: miniprot WASM + BUSCO lineage datasets packaged as reference packs (bacteria, archaea, fungi, selected eukaryote lineages; check BUSCO dataset licence). Compute complete/single/duplicated/fragmented/missing in compleasm style. Validate against BUSCO/compleasm on 5 genomes.
- [ ] [M2] Comparative: skani (or sourmash) WASM for ANI matrices with clustered heatmap; minimap2 asm-mode PAF → dotplot/synteny viewer.
- [ ] [M3] Pan-genome viewer for Panaroo/Roary `gene_presence_absence` files: core/accessory curves, presence/absence heatmap ordered by tree, gene search.
- [ ] [M3] Prokaryotic gene prediction: Prodigal WASM (isolated GPL module) → GFF3 → browser track + protein FASTA for Structure Studio.
- [ ] [M3] Regions & Tracks: Rust interval engine (intersect/merge/subtract/closest/coverage/window with strand options), validated against bedtools on fixtures. UI for set operations with UpSet plots.
- [ ] [M3] Peak annotation: genomic feature assignment (promoter window, 5′UTR, exon, intron, 3′UTR, intergenic) and nearest TSS from GTF; distribution plots; gene list export into Expression Studio enrichment.
- [ ] [M3] Signal profiles: bigWig (`@gmod/bbi`) matrix around TSS/summits/region set → average profile and sorted heatmap (canvas), deepTools-style.
- [ ] [M3] Motif scanning: JASPAR CORE pack (CC BY 4.0) PWMs; Rust log-odds scanning with p-value thresholds; enrichment vs shuffled/background regions (Fisher's test); motif logo rendering.
- [ ] [M3] Microbial mode: AMRFinderPlus (public domain) feasibility spike in WASM (BLAST+/HMMER deps) → if not feasible, mark as cloud tool. Nextclade link/embedding for viral clade assignment.
- [ ] [M2] Variant ingest: Rust VCF/BCF → Arrow/Parquet kernel (INFO/FORMAT parsing driven by header, multi-allelic normalization option via bcftools norm WASM), stored in OPFS and registered in DuckDB. DoD: 5M-variant VCF.gz ingested on a 16 GB machine; tested on GIAB HG002 exome and WGS chr20.
- [ ] [M2] Variant QC dashboard: Ti/Tv, het/hom, depth/GQ distributions, variant type and size spectrum, per-sample metrics, sex check, kinship (KING-robust on common sites, Rust).
- [ ] [M2] Filter builder: visual rule builder → SQL (DuckDB), saved filter presets, filter funnel chart with counts, gene-panel and region filters (BED/list), inheritance models from PED (AD, AR, X-linked, compound het, de novo).
- [ ] [M2] Annotation: `bcftools csq` WASM with GFF3 + FASTA (small genomes and human via remote indexed FASTA where workable); Ensembl VEP REST client (batched ≤ 200, rate-limited, consent); MyVariant.info client for ClinVar/gnomAD/dbSNP fields, filtered by a licence-aware field allow-list; CIViC client. Annotations stored as joined Parquet columns.
- [ ] [M2] Variant grid + detail panel: transcript consequences, population frequencies, ClinVar evidence, protein position with link to Structure Studio (map residue on AlphaFold model), igv.js locus view.
- [ ] [M2] ACMG/AMP evidence helper: structured criteria checklist per variant with auto-suggested evidence where data supports it (e.g. PM2 from gnomAD frequency). The user decides; mark everything RUO; export an evidence summary.
- [ ] [M3] Somatic mode: MAF/VCF ingest for tumor cohorts, oncoplot, lollipop (UniProt/InterPro domains), TMB (configurable callable size), VAF distribution and clonality hints, CIViC actionability table.
- [ ] [M3] Mutational signatures: SBS96 context extraction (needs reference FASTA via indexed remote access), NNLS refitting (Rust) against an openly licensed signature reference (document source and licence; if COSMIC signature licensing blocks commercial use, use published de novo signature matrices with appropriate terms or let users load their own), bootstrap stability.
- [ ] [M3] CNV views: SEG import, genome-wide plot, per-gene copy-number table, cohort frequency plot.
- [ ] [M3] Liquid biopsy: longitudinal VAF tracking across timepoints, tumor fraction estimation from somatic VAFs (documented method), fragment-length distribution from small targeted BAMs (samtools WASM).
- [ ] [M3] Population mode: GWAS summary statistics ingest (GWAS-SSF and common column auto-mapping), WebGL Manhattan + QQ, λGC, distance-based clumping, LocusZoom-style regional plots (locuszoom.js), lead-variant annotation via VEP/MyVariant.
- [ ] [M3] Microbiome: BIOM (v1 JSON / v2 HDF5 via h5wasm), TSV, QIIME 2 `.qza` (zip → inner formats), MetaPhlAn/Kraken/Bracken report importers into a `FeatureTable` with taxonomy, tree and metadata.
- [ ] [M3] Microbiome ecology kernels (Rust): alpha (observed, Shannon, Simpson, Chao1, Faith PD), beta (Bray-Curtis, Jaccard, Aitchison, weighted/unweighted UniFrac), PCoA (eigendecomposition), NMDS, PERMANOVA/PERMDISP (permutations parallelized across workers). Validate against scikit-bio/vegan outputs.
- [ ] [M3] Microbiome UI: filtering/rarefaction, taxa bar plots at any rank, sunburst, alpha boxplots with tests, ordination plots with group ellipses, DA results (CLR+Welch/Wilcoxon Monte-Carlo, LinDA).
- [ ] [M3] Local 16S classifier: Rust naive-Bayes k-mer classifier (RDP-style, bootstrap confidence) with a Greengenes2-trained reference pack. Validate accuracy on a mock community.

### Phase 4 — RNA-seq / Single-cell (Expression Studio + Single-Cell & Spatial Studio)
- [ ] [M1] Expression import: count matrix (CSV/TSV/Excel) with gene-ID column detection; sample sheet editor (paste/upload, type inference); nf-core/rnaseq importers (salmon `quant.sf` per sample → gene-level via tx2gene from GTF; featureCounts; merged gene counts). Validation of sample/column matching.
- [ ] [M1] ID mapping: bundled Ensembl ↔ symbol ↔ Entrez tables for human/mouse/rat/zebrafish/fly/yeast/Arabidopsis (reference packs built from Ensembl BioMart exports); MyGene.info fallback.
- [ ] [M1] Design builder: factors, levels, reference level, design formula with interaction terms, contrast builder, rank/confounding checks with clear errors.
- [ ] [M1] QC panel: library sizes, detected genes, density/box plots of log counts, sample correlation clustered heatmap, PCA (randomized SVD in Rust on VST) with PC selection, loadings and color-by-factor, outlier flags.
- [ ] [M1] Normalization (Rust): median-of-ratios size factors, TMM, CPM/TPM (lengths from GTF or salmon), VST (DESeq2-style parametric fit) for visualization.
- [ ] [M1] DE engine A: PyDESeq2 in the Pyodide worker. Wald/LRT, independent filtering, Cooks outlier handling, LFC shrinkage where supported. Results to Arrow.
- [ ] [M1] DE engine B: native Rust limma-voom-style pipeline (voom weights, lmFit, eBayes moderated t, BH). Validate against R limma on 3 datasets.
- [ ] [M1] DE results UI: results grid, volcano and MA (linked selection), top-gene clustered heatmap, per-gene count plot by group, thresholds panel, contrast comparison (UpSet + scatter of LFCs).
- [ ] [M1] Enrichment: ORA (hypergeometric, BH) and preranked GSEA (Rust fgsea-style multilevel, ≥ 10k permutations equivalent) with bundled GO (BP/MF/CC) and Reactome packs. Results table, dot/bar plots, enrichment curve, leading-edge genes. Optional g:Profiler/Enrichr API.
- [ ] [M1] STRING network for selected genes (API client, consent), rendered with Cytoscape.js; color by LFC.
- [ ] [M1] Expression report: figures + tables + parameters + auto Methods + citations (DESeq2/PyDESeq2, limma, GO, Reactome).
- [ ] [M2] GEO importer: GSE accession → series matrix/supplementary counts via E-utilities/HTTPS (edge proxy if CORS blocks), sample annotation parsing to a sample sheet.
- [ ] [M3] Batch handling: batch as a covariate (default), ComBat-seq clean-room reimplementation for visualization/export, before/after PCA.
- [ ] [M3] Deconvolution: NNLS with user or bundled signature matrices (licence-checked).
- [ ] [M3] Proteomics mode: MaxQuant `proteinGroups.txt`, DIA-NN/FragPipe matrices import; filtering (contaminants/reverse), log2 + median/quantile normalization, missing value imputation options (MinProb, kNN), limma DE, enrichment reuse.
- [ ] [M2] Single-cell import: 10x MTX folder, 10x `.h5`, `.h5ad` (h5wasm), Zarr AnnData (zarrita), CSV. Memory estimate before load; option to load only filtered barcodes / HVG subset.
- [ ] [M2] scran.js/bakana integration in a dedicated worker: QC metrics and adaptive filters, log-normalization, HVG, PCA, MNN batch correction, kNN/SNN graph, Leiden/Louvain clustering, t-SNE/UMAP, marker detection. Every step is a resumable job with cached intermediates in OPFS.
- [ ] [M2] Single-cell UI: step-wise workflow panel with parameters, WebGL embedding (color by cluster/gene/QC/metadata, lasso), dot plot, violin, feature plots, marker table per cluster, cluster rename/merge, custom selections → DE.
- [ ] [M2] Cluster annotation: marker-based scoring with user gene sets; reference-based label transfer (SingleR-style, as provided in the kanaverse ecosystem) with licence-checked references packaged as packs.
- [ ] [M2] Pseudobulk DE: aggregate counts per sample × cluster → Expression Studio DE engine; UI enforces sample-level replication and explains why.
- [ ] [M2] Single-cell export: `.h5ad` with obs/var/obsm (embeddings, clusters, annotations) via h5wasm, readable by scanpy (verified in a test).
- [ ] [M3] Doublet scoring (simulation-based, scDblFinder-like, Rust or scran.js if available) and cell-cycle scoring.
- [ ] [M3] Spatial import: Space Ranger outputs (tissue image, scale factors, positions, matrix), SpatialData Zarr (images via Viv, shapes/points/tables).
- [ ] [M3] Spatial analyses: spatial neighbor graph (radius/kNN, Rust), Moran's I / Geary's C for spatially variable genes (permutation p-values across workers), spatial domain clustering (expression + neighborhood smoothing), NNLS spot deconvolution with a single-cell reference from the project.
- [ ] [M3] Spatial viewer: deck.gl layers over Viv image pyramids; spots/cells colored by gene/cluster/deconvolution proportions; linked to the embedding view.
- [ ] [M4] Cloud execution of nf-core/scrnaseq and atlas-scale integration (scVI on GPU) with results re-imported.

### Phase 5 — Protein / Structure (Structure Studio)
- [ ] [M1] `MolViewer3D`: Mol* wrapped as a React component with a controlled API (load from file/URL/PDB ID/AlphaFold ID, set representation/color/selection, focus, screenshot, session state serialize).
- [ ] [M1] Structure loading: PDB/mmCIF/BinaryCIF upload, RCSB fetch (with assembly choice), AlphaFold DB fetch by UniProt ID (model + PAE JSON). Entity/chain/ligand tree panel.
- [ ] [M1] Sequence-structure linking: Nightingale (or custom) sequence track synchronized with Mol* selection; SIFTS/UniProt numbering mapping.
- [ ] [M1] Protein features: properties panel (from Sequence Studio engine), UniProt features (domains, PTMs, variants) and InterPro domains via API, mapped onto structure.
- [ ] [M1] Confidence: pLDDT coloring and per-residue plot; interactive PAE heatmap linked to 3D selection (select PAE block → highlight residues).
- [ ] [M1] Structure analyses (WASM): DSSP secondary structure, FreeSASA per-residue SASA/relative SASA, contacts and clashes (Rust neighbor grid), measurements (distance/angle/dihedral).
- [ ] [M1] Interaction profiler (Rust, clean-room from published geometric criteria): H-bonds, hydrophobic contacts, π-stacking, π-cation, salt bridges, halogen bonds, water bridges, metal coordination for protein–ligand and protein–protein interfaces. Results table, 3D dashed-line rendering, 2D interaction diagram (RDKit.js depiction + residue nodes). Validate against PLIP outputs on 20 complexes (metrics: per-interaction-type recall/precision).
- [ ] [M1] Pockets: fpocket WASM → pocket list with descriptors (volume, hydrophobicity, druggability score), 3D pocket rendering, residue lists, "use as docking box".
- [ ] [M1] Comparison: Kabsch superposition by sequence alignment mapping, per-residue RMSD plot, TM-align/US-align WASM (after licence verification) for structure-based alignment and TM-score; multi-structure overlay.
- [ ] [M1] Residue data mapping: color structure by any per-residue table (conservation from Phylo Studio, variants from Variant Studio, ESM scores, user CSV) via a shared `ResidueTrack` type.
- [ ] [M1] Publication images: preset styles (cartoon + ligand sticks, surface by property), transparent PNG at high resolution, simple turntable movie export (WebCodecs → MP4/WebM where supported).
- [ ] [M2] Docking: Vina WASM engine; receptor prep (strip waters/ligands, add polar hydrogens, assign charges via documented rules or Meeko-equivalent after licence check); ligand prep from Chemistry Studio (RDKit.js 3D embedding + protonation at pH 7.4 via rules); box from pocket/ligand/manual; exhaustiveness and seed controls; batch ≤ 50 ligands across the worker pool; poses table with scores, interaction profiles and 3D view. Validate redocking RMSD ≤ 2 Å on a benchmark subset (e.g. 20 PDBbind-core complexes with suitable licence, or PDB-derived set).
- [ ] [M3] ESM-2 in browser: export ESM-2 35M/150M to ONNX (quantized), ONNX Runtime Web worker with WebGPU/WASM fallback; per-residue embeddings; zero-shot masked-marginal mutation scanning heatmap (all substitutions); map onto structure. Validate against published DMS correlations on 3–5 proteins.
- [ ] [M3] Simple trajectory viewing (DCD/XTC small) in Mol* with RMSD/RMSF plots (Rust).
- [ ] [M4] Structure prediction jobs (Boltz-2 / OpenFold3 / ESMFold) on cloud GPU through the job API; results imported with pLDDT/PAE into this studio.

### Phase 6 — Cheminformatics / QSAR (Chemistry Studio)
- [ ] [M1] RDKit.js engine worker: molecule parsing (SMILES/SDF/MOL/InChI), canonicalization, depiction (SVG) with an OPFS thumbnail cache, descriptors, fingerprints (Morgan/FCFP/MACCS/atom-pair/topological torsion as available), substructure match, FilterCatalog (PAINS/Brenk/NIH), Murcko scaffolds, MolStandardize functions (verify coverage; list gaps for Pyodide fallback).
- [ ] [M1] `MoleculeTable` dataset backed by Arrow (SMILES/molblock column + properties), with DataGrid structure-cell renderer and a grid/card toggle.
- [ ] [M1] Ketcher editor integration (React), with draw-to-search and draw-to-add, SMILES/MOL round-trip.
- [ ] [M1] Import: SMILES/CSV/Excel (column mapping), SDF (with properties), PubChem and ChEMBL lookups by name/ID; OPSIN name-to-structure via an allowed service.
- [ ] [M1] Curation pipeline with a report: parse failures, salt stripping, neutralization, tautomer canonicalization (option), stereo flags, InChIKey duplicate merging (with aggregation rules for numeric columns).
- [ ] [M1] Properties & filters: descriptor panel (MW, cLogP, TPSA, HBD, HBA, RotB, Fsp3, rings, QED), rule sets (Lipinski, Veber, Ghose, lead-like), structural alerts; filter builder; property histograms/radar; comparison vs an approved-drug reference distribution (pack built from openly licensed data).
- [ ] [M1] Similarity search: precompute fingerprints into bit-packed `Uint32Array`s (worker + OPFS cache keyed by dataset hash); Rust SIMD popcount Tanimoto/Dice scan; top-k and threshold queries; query by drawn or selected molecule. DoD: 1M fingerprints scanned in < 1 s on a 16 GB desktop.
- [ ] [M1] Substructure search: SMARTS/drawn query with fingerprint prefilter and RDKit verification; highlighted matches in thumbnails.
- [ ] [M1] Library analysis: Butina clustering (Rust on fingerprint distances, with a memory guard), MaxMin diversity picking, scaffold frequency table and scaffold tree view, chemical-space map (PCA/UMAP on fingerprints) in WebGL linked to the grid.
- [ ] [M2] SAR tools: R-group decomposition (RDKit) with a core from MCS or user SMARTS; R-group table/heatmap of activity; activity cliffs (SALI) network view.
- [ ] [M2] QSAR dataset builder: ChEMBL target search → activities fetch (paginated, rate-limited) → unit harmonization → pChEMBL/pIC50 → replicate aggregation (median, with conflict flags) → curated dataset with provenance (ChEMBL release recorded).
- [ ] [M2] Featurization: fingerprints (configurable radius/bits), RDKit 2D descriptors (RDKit.js; Pyodide RDKit for the full descriptor set if needed), user descriptors; variance/correlation filtering; scaling.
- [ ] [M2] Splits: random, scaffold, Butina cluster, temporal (if a date column exists), stratified for classification; split visualization on the chemical-space map.
- [ ] [M2] Modeling (Pyodide worker): RF, ExtraTrees, gradient boosting (scikit-learn HistGradientBoosting and/or XGBoost), kNN, SVM, ridge/PLS; classification and regression; hyperparameter search (small grid/random with CV) with progress and cancel.
- [ ] [M2] Validation: k-fold CV and external test metrics (R², RMSE, MAE, Spearman; ROC-AUC, PR-AUC, MCC, balanced accuracy), Y-randomization, learning curves; parity, ROC and PR plots; residual analysis.
- [ ] [M2] Interpretability: permutation importance, TreeSHAP for tree models, atom-contribution similarity maps for fingerprint models rendered with RDKit.js.
- [ ] [M2] Applicability domain: kNN Tanimoto distance to training set, leverage for descriptor models; AD flags on predictions.
- [ ] [M2] Model persistence: save model (pickle stays inside Pyodide/OPFS; export ONNX via skl2onnx where available for portable in-browser inference), model card (OECD principles: endpoint, algorithm, AD, validation, mechanistic interpretation field).
- [ ] [M2] Prediction: apply a saved model to a new MoleculeTable with AD flags; send top compounds to Structure Studio docking.
- [ ] [M4] Chemprop GNN training/prediction on cloud GPU through the job API.

### Phase 7 — Integration / UX
- [ ] [M1] Cross-studio handoffs via typed "Open in…" actions:
  - Sequence → Structure (protein)
  - Variant → Structure (residue)
  - Phylo conservation → Structure
  - Expression DE genes → Atlas/STRING/enrichment
  - Single-cell markers → Expression enrichment
  - Chemistry → Structure docking
  - Structure ligand → Chemistry similarity
  - Genome peaks → Expression enrichment
- [ ] [M1] Guided walkthroughs per studio (step overlays, skippable, remembered) using the built-in example datasets. Each finishes in < 3 minutes.
- [ ] [M1] Empty states, loading states (skeletons; engine-download progress with size), error states (actionable messages with "what to do next"), and consistent toasts. Motion guidelines: 150–250 ms ease-out transitions, no motion on data-dense redraws, honor `prefers-reduced-motion`.
- [ ] [M1] Keyboard-first UX: shortcuts per studio (documented in the command palette), focus management, full keyboard navigation of grids and viewers where possible.
- [ ] [M1] Accessibility: WCAG 2.2 AA for UI chrome, colorblind-safe default palettes, text alternatives for charts (data table view of every chart), axe checks in CI.
- [ ] [M1] Network transparency badge: counts bytes sent to external hosts per session/project, with a drill-down list linking to provenance entries.
- [ ] [M1] Docs site (`apps/docs`): per-studio user guides, method descriptions with equations and citations, file-format guides, FAQ on privacy and browser limits, "How to cite", licences page.
- [ ] [M2] Report builder integration across all studios (add any chart/table/text to the report; figure composer with journal size presets).
- [ ] [M2] Session restore: reopen a project with all studio states (viewer camera, filters, selections) restored.
- [ ] [M2] nf-core results import wizard: point at a results folder (File System Access) and auto-detect the pipeline and outputs (rnaseq, sarek, scrnaseq, ampliseq, mag, viralrecon), then route to the right studios.
- [ ] [M3] Reproducible script export: per-tool templates generating Python (PyDESeq2/scanpy/RDKit/scikit-learn), R (DESeq2/limma) or shell (samtools/bcftools/minimap2/MAFFT) scripts equivalent to the in-browser analysis, with parameter mapping documented and tested on golden datasets.
- [ ] [M3] Localization framework (i18n keys everywhere; English first, with Hindi/other Indian languages possible later for UI chrome).
- [ ] [M4] Accounts, cloud projects and sync (Stage 2 of §11); sharing a read-only project link.
- [ ] [M4] Job gateway + cloud executor implementing the `Executor` interface (WES/TES-compatible), with routing by `estimate()` and explicit user consent for upload.
- [ ] [M4] Assistant layer: natural-language → proposed job plan built from tool manifests, shown as editable steps before execution; MCP server exposing tool manifests.

### Phase 8 — Testing / Validation
- [ ] [M1] Golden dataset registry (`/validation/datasets`): small public datasets per studio with licences and citations (e.g. pasilla / airway for RNA-seq, PBMC 3k/10k for single-cell, GIAB HG002 subsets for variants, mock community for 16S, PDBbind-like / PDB-derived set for interactions and docking, ChEMBL-derived set for QSAR, lambda phage / E. coli for alignment).
- [ ] [M1] Reference outputs pipeline: Dockerized scripts that run the reference tools (R DESeq2/limma, scanpy/scran, bcftools/samtools native, MAFFT/FastTree native, RDKit Python, native Vina, PLIP, bedtools, scikit-bio/vegan) and store outputs plus versions.
- [ ] [M1] Concordance tests in CI (headless Chromium via Playwright running the real WASM/Pyodide engines) with explicit tolerances per tool:
  - DE: log2FC Pearson ≥ 0.999 and padj agreement within 1e-6 relative where deterministic.
  - Single-cell: ARI ≥ 0.9 vs reference clustering with the same parameters.
  - Variant QC: exact counts.
  - Interactions: ≥ 95% recall/precision vs PLIP.
  - Fingerprints/descriptors: exact match with RDKit Python of the same version.
- [ ] [M1] Public validation page generated from CI results (per release: tool, engine version, dataset, metrics, pass/fail, date).
- [ ] [M1] Unit tests for all Rust kernels (native `cargo test` + `wasm-bindgen-test`) and TS packages (Vitest), with coverage thresholds for `@wb/core`, `@wb/io` and `@wb/compute` (≥ 85%).
- [ ] [M1] Parser robustness: property-based tests (fast-check) and fuzzing of Rust parsers (`cargo-fuzz`) for FASTA/FASTQ/VCF/GFF/BED/SDF; malformed-file fixture suite with expected error messages.
- [ ] [M1] End-to-end tests (Playwright, Chromium + Firefox + WebKit): for each studio, load example data → run the main workflow → assert key result values and that exports download.
- [ ] [M1] Performance tests: scripted benchmarks per engine on fixed inputs, tracked over time (regression threshold 15%); bundle-size budget checks; Lighthouse CI on shell and studio routes.
- [ ] [M1] Memory tests: run the large-input scenarios (5 GB FASTQ stream, 5M-variant VCF, 100k-cell matrix, 1M fingerprints) in CI nightly on a large runner; record peak memory via `performance.measureUserAgentSpecificMemory` where available.
- [ ] [M1] Visual regression for charts and viewers (Playwright screenshots with tolerance) in light and dark themes.
- [ ] [M1] Security checks: CSP violation reporting in staging, dependency/OSV scanning, licence-policy check (from Phase 1) gating releases, SBOM published per release.
- [ ] [M1] Release process: semantic versioning, changelog, Zenodo DOI via GitHub integration, `CITATION.cff`, engine version table in release notes.
- [ ] [M2] External beta validation: a structured program with 3–5 academic labs per studio, comparing results with their existing pipelines; issues tracked and outcomes summarized on the validation page.
- [ ] [M2] Prepare the application-note manuscript (architecture, validation, benchmarks) targeting the NAR Web Server issue or *Bioinformatics*.
