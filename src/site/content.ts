// All marketing copy lives here so it can be edited without touching layout code.
// Nothing here claims results, partners or headcount that do not exist.

// ---------- Internship batch (fill in when a batch is announced; empty values are hidden) ----------
/** BUSINESS DETAILS for the next internship intake, e.g. { start: '2027-01-06', duration: '8 weeks', mode: 'Remote', stipend: null, fee: null, deadline: '2026-12-15', applyUrl: null }.
 *  Values left null are shown as "To be announced"; the page offers a register-interest form until the intake opens. */
export const INTERN_BATCH = { start: null as string | null, duration: null as string | null, mode: null as string | null, fee: null as string | null, stipend: null as string | null, deadline: null as string | null, applyUrl: null as string | null };

// ---------- Internships ----------
export interface Track { id: string; name: string; summary: string; you: string[]; learn: string[]; fit: string }
export const TRACKS: Track[] = [
  { id: 'compbio', name: 'Computational Biology', summary: 'Analyse real sequencing, expression and variant data and turn it into defensible biological conclusions.', you: ['Reproduce a published analysis end to end', 'Build and document a reusable workflow', 'Present findings with proper statistics'], learn: ['Genomics & RNA-seq analysis', 'Statistics for high-dimensional data', 'Reproducible research practice'], fit: 'Biology, biotechnology, bioinformatics or statistics students who like asking why a result is believable.' },
  { id: 'algorithms', name: 'Algorithms & Methods', summary: 'Implement, test and benchmark methods such as alignment, clustering and phylogenetics from first principles.', you: ['Implement a published algorithm from the paper', 'Write tests against a known ground truth', 'Profile and speed up the hot path'], learn: ['Dynamic programming & graph methods', 'Numerical correctness and testing', 'Performance in the browser (Workers, WebAssembly)'], fit: 'Computer science, maths or engineering students comfortable with Python, TypeScript or Rust.' },
  { id: 'ai', name: 'AI for Biology', summary: 'Prototype and evaluate machine-learning models on biological data, with an emphasis on honest validation.', you: ['Build a baseline before reaching for a bigger model', 'Design a leakage-free evaluation', 'Write a model card that states the limits'], learn: ['Applied machine learning', 'Cross-validation by cluster and homology', 'Applicability domains & uncertainty'], fit: 'Students with some ML background who want to learn how to make biological ML trustworthy.' },
  { id: 'software', name: 'Software & Visualisation', summary: 'Design the interfaces and engineering that make complex analyses understandable and dependable.', you: ['Ship a feature in a production scientific app', 'Design interactive, accessible figures', 'Write the tests that keep it correct'], learn: ['TypeScript, React & canvas/WebGL', 'Scientific data visualisation', 'Testing and release engineering'], fit: 'Students who enjoy front-end, data visualisation or developer tooling and care about detail.' },
];
export const INTERN_STEPS = [
  { t: 'Apply', d: 'Tell us about your background and interests. No prior publications needed.' },
  { t: 'Assessment', d: 'A short, practical exercise suited to your chosen track.' },
  { t: 'Match', d: 'We pair you with a mentor and a scoped project.' },
  { t: 'Build', d: 'Work in weekly cycles with code and scientific review.' },
  { t: 'Showcase', d: 'Present your project and publish what can be public.' },
];
export const INTERN_FAQ = [
  { q: 'Who can apply?', a: 'Undergraduate, postgraduate and recently graduated students in biology, computer science, statistics, engineering and related fields. Strength in either side of the biology/computing divide is welcome; we teach the other side.' },
  { q: 'What are the dates, duration and format?', a: 'Cohort dates, duration, remote or on-site arrangements and any stipend are announced with each intake. This page will be updated, and registering interest below puts you on the list to hear first.' },
  { q: 'Do I need to know bioinformatics already?', a: 'No. The assessment looks at how you reason and learn. Our courses can prepare you before an internship if you want a stronger start.' },
  { q: 'Is there a certificate?', a: 'Yes. Interns who complete their project receive a certificate with a unique ID that can be checked on our certificate verification page, and a project they can show in a portfolio.' },
  { q: 'Will my work be public?', a: 'Where the project allows, yes: code, figures and write-ups you author are credited to you. Anything that cannot be public is discussed upfront.' },
  { q: 'What tools will I use?', a: 'The same browser-based studios you can open on this site, plus standard scientific Python, TypeScript and command-line tooling.' },
];

// ---------- Research ----------
export const THEMES = [
  { t: 'Algorithms & methods', d: 'Clean-room implementations of published methods, tested against simulated ground truth.' },
  { t: 'Statistical genomics', d: 'Batch correction, enrichment and differential analysis with honest uncertainty.' },
  { t: 'Machine learning for molecules & sequences', d: 'Models evaluated with cluster-aware validation and explicit applicability domains.' },
  { t: 'Structural & chemical informatics', d: 'Interaction profiling, pocket detection and chemical-space analysis.' },
  { t: 'Microbiome & metagenomics', d: 'Phylogeny-aware diversity, ordination and compositional differential abundance.' },
];
export interface Algo { name: string; area: string; where: string; check: string }
export const ALGOS: Algo[] = [
  { name: 'Global and local alignment (affine gaps, BLOSUM62)', area: 'Sequence', where: 'Sequence Studio', check: 'Unit-tested for global, local and protein alignment' },
  { name: 'Primer design, in-silico PCR, cloning (restriction, Golden Gate, Gibson)', area: 'Sequence', where: 'Sequence Studio', check: 'Designed products re-derived; invalid assemblies refused with a reason' },
  { name: 'CRISPR guide search and off-target scan', area: 'Sequence', where: 'Sequence Studio', check: 'Finds planted mismatched sites; PAM handling tested' },
  { name: 'Progressive multiple alignment', area: 'Phylogenetics', where: 'Phylogenetics', check: 'Keeps every residue; places a simple indel correctly' },
  { name: 'Neighbour-joining, UPGMA + bootstrap', area: 'Phylogenetics', where: 'Phylogenetics', check: 'Recovers an additive tree and planted bootstrap-supported clades' },
  { name: 'Maximum-likelihood trees (JC69, K80, HKY85, Poisson, ±Γ)', area: 'Phylogenetics', where: 'Phylogenetics', check: 'Matches closed-form likelihoods; recovers the true topology on simulated data' },
  { name: 'MinHash ANI', area: 'Genome', where: 'Genome Studio', check: 'Zero distance for identical genomes; estimates ANI of diverged ones' },
  { name: 'Read mapping & SNV calling (minimap2 + samtools, WebAssembly)', area: 'Genome', where: 'Genome Studio', check: 'End-to-end test recovers 5 of 5 planted variants, no false positives' },
  { name: 'Moderated-t differential expression', area: 'Expression', where: 'Expression Studio', check: 'Recovers planted genes with controlled FDR; BH matches R' },
  { name: 'ComBat batch correction', area: 'Expression', where: 'Expression Studio', check: 'Removes a planted batch shift and keeps the biological effect' },
  { name: 'ORA and preranked GSEA', area: 'Expression', where: 'Expression Studio', check: 'Detects planted sets; planted pathway ranks first end to end' },
  { name: 'SNN-Louvain clustering, clean-room UMAP / t-SNE', area: 'Single-cell', where: 'Single-Cell Studio', check: 'Recovers four planted cell types (ARI > 0.9)' },
  { name: 'NMF mutational signatures (no COSMIC)', area: 'Variants', where: 'Variant Studio', check: 'Recovers two planted signatures (cosine > 0.95)' },
  { name: 'Weighted / unweighted UniFrac, PERMANOVA', area: 'Microbiome', where: 'Microbiome Studio', check: 'Matches hand-computed values; detects a planted effect, not a shuffled one' },
  { name: 'Random forest / kNN / ridge QSAR, Butina clustering', area: 'Chemistry', where: 'Chemistry Studio', check: 'Learns a known function; Y-randomisation collapses performance' },
  { name: 'Interaction profiling, pockets, SASA, Kabsch + TM-score', area: 'Structure', where: 'Structure Studio', check: 'Engineered-site tests; SASA and superposition recover known values; checked on PDB 1HSG' },
];

// ---------- Products ----------
export type Stage = 'Live' | 'Validation' | 'Prototype' | 'Research';
export interface Product { id: string; name: string; tag: string; stage: Stage; body: string; points: string[]; live?: boolean }
export const PRODUCTS: Product[] = [
  { id: 'workbench', name: 'The Workbench', tag: 'Analysis platform', stage: 'Live', live: true, body: 'Nine integrated studios for sequences, genomes, variants, expression, single-cell, microbiome, chemistry and structure. Runs in your browser; your files stay on your device.', points: ['0 bytes of your data uploaded', 'Auto-written methods and provenance', 'Nothing to install'] },
  { id: 'copilot', name: 'Analysis Copilot', tag: 'AI · in development', stage: 'Prototype', body: 'An assistant that turns a plain-language question into a reproducible workflow you can read, rerun and cite, with every step visible.', points: ['Shows its plan before it runs', 'Every output links to code and parameters', 'No release date announced'] },
  { id: 'cloud', name: 'Pipeline Cloud', tag: 'Compute · in development', stage: 'Research', body: 'Managed execution of heavy pipelines, such as FASTQ to counts and large alignments, that exceed what a laptop browser should attempt.', points: ['Same job spec as the Workbench', 'Results flow back into the studios', 'No release date announced'] },
  { id: 'molecule', name: 'Molecule & Structure Intelligence', tag: 'AI · in development', stage: 'Research', body: 'Learned models for properties and interactions, built on the QSAR discipline we already enforce: honest validation and stated applicability.', points: ['Cluster-aware evaluation by default', 'Model cards with explicit limits', 'No release date announced'] },
];

// ---------- Trust ----------
export const TRUST = [
  { t: 'Private by construction', d: 'Files are analysed in your browser with Web Workers and WebAssembly. A live badge shows the bytes you have sent anywhere.' },
  { t: 'Reproducible by default', d: 'Each analysis records tool, version, parameters and an input hash, and writes the methods paragraph with citations.' },
  { t: 'Validated against ground truth', d: 'Studios ship labelled synthetic datasets and, wherever it is possible, check their own answer against the planted truth.' },
  { t: 'Licence-audited', d: 'Every dependency passes an automated permissive-licence gate. Data sources and their terms are listed publicly.' },
];
