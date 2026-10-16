// Nayancode products. Every "live" product below is real and runs in this build (open its `app` route). Analyses,
// inputs and limits come from the studio registry (src/core/studios.ts) so product pages never promise more than the
// software does. Licensing: free during the public preview; institutional licences, self-hosted deployments and
// support plans are quoted on request (no fixed price has been set).
import { STUDIOS, studioById } from '@/core/studios';

import type { ProductLine } from './labels';
export { PRODUCT_LINES, type ProductLine } from './labels';
export interface Product {
  slug: string;
  name: string;
  line: ProductLine;
  tagline: string;
  short: string;
  description: string[];
  features: { t: string; d: string }[];
  useCases: string[];
  inputs: string[];
  outputs: string[];
  engine: string;
  limits: string;
  app: string;
  studio?: string;
  /** Screenshot captured from the running app by scripts/screens.mjs. */
  shot: string;
  courses: string[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
}

const st = (id: string) => studioById(id)!;
const shot = (slug: string) => `/img/products/${slug}.webp`;

export const PRODUCTS: Product[] = [
  {
    slug: 'workbench', name: 'Nayancode Workbench', line: 'Platform', app: '/workbench', shot: shot('workbench'), courses: ['ngs-data-analysis', 'rna-seq-data-analysis', 'cheminformatics-qsar-modelling'],
    tagline: 'Nine analysis studios. One private workspace in your browser.',
    short: 'The complete suite: sequence, genome, variant, expression, single-cell, microbiome, chemistry, structure and phylogenetics studios.',
    description: ['Nayancode Workbench brings nine analysis studios together in one workspace that runs entirely in your web browser. Files are analysed on your own computer with Web Workers and WebAssembly, so unpublished or confidential data never leave your device.', 'Every analysis records its tool, version, parameters and input checksum and writes a methods paragraph with citations. Figures can be collected into a report and exported with the methods, so results stay reproducible from the first click.'],
    features: [
      { t: 'Private by design', d: 'Computation happens in your browser. A live network meter shows exactly how many bytes have been sent anywhere.' },
      { t: 'Methods that write themselves', d: 'Each analysis records parameters and versions and produces a citable methods paragraph.' },
      { t: 'Studios that hand off to each other', d: 'Pass a genome region to the variant studio, or a gene to the structure studio, without exporting files.' },
      { t: 'Validated against known answers', d: 'Every studio ships synthetic demo data and, wherever possible, checks its own answer against the planted truth.' },
      { t: 'nf-core import', d: 'Run heavy pipelines elsewhere, then drop the results in: counts, single-cell matrices, VCFs and MultiQC statistics.' },
      { t: 'Report builder', d: 'Collect figures from any studio and export one self-contained HTML or PDF report with methods and provenance.' },
    ],
    useCases: ['Teaching hands-on bioinformatics without installing software', 'Exploring confidential data before it can be shared', 'Quick analyses between pipeline runs', 'Preparing publication figures with recorded methods'],
    inputs: ['FASTA, FASTQ, BED/GFF', 'VCF and GWAS summary statistics', 'Count matrices and sample sheets', 'SMILES and compound tables', 'PDB/mmCIF, PDB and UniProt IDs', 'Newick trees, feature tables'],
    outputs: ['Interactive figures (PNG/SVG export)', 'Result tables (CSV)', 'Auto-written methods with citations', 'HTML/PDF reports'],
    engine: 'TypeScript kernels in Web Workers, WebAssembly (minimap2, samtools, RDKit), Mol*, igv.js',
    limits: 'Designed for browser-scale data (for example, mapping up to about a 100 Mb reference). Larger jobs belong on a cluster or cloud pipeline; results can then be imported.',
    seoTitle: 'Nayancode Workbench: Bioinformatics Software in Your Browser',
    seoDescription: 'Free, private bioinformatics software that runs in your browser: sequence, genome, variant, RNA-seq, single-cell, microbiome, cheminformatics, structure and phylogenetics studios.',
    keywords: ['online bioinformatics software', 'bioinformatics platform browser', 'free bioinformatics tools online', 'private genomics analysis'],
  },
  {
    slug: 'sequence-studio', name: 'Nayancode Sequence Studio', line: 'Genomics & transcriptomics', studio: 'sequence', app: st('sequence').path, shot: shot('sequence-studio'), courses: ['bioinformatics-foundations', 'gene-cloning-recombinant-dna', 'molecular-biology-techniques'],
    tagline: 'Design, digest, clone and align, before you pick up a pipette.',
    short: 'DNA, RNA and protein analysis: ORFs, digests and virtual gels, primers and in-silico PCR, cloning, guide design, Sanger traces and alignment.',
    description: ['Sequence Studio is a molecular-biology bench on screen. Find open reading frames, simulate restriction digests on a virtual gel, design primers and test them by in-silico PCR, plan Golden Gate and Gibson assemblies, and inspect Sanger traces against a reference.', 'It is built for the daily questions of wet-lab scientists and for teaching: every result is visual, every parameter is explained and nothing needs to be installed.'],
    features: [
      { t: 'Cloning simulator', d: 'Restriction, Golden Gate and Gibson assembly with primer design; invalid assemblies are refused with a reason.' },
      { t: 'Primers and in-silico PCR', d: 'Design primers with Tm, GC and dimer checks and confirm the products they would amplify.' },
      { t: 'Digest and virtual gel', d: 'Restriction maps and a gel image with ladders, so you know what to expect at the bench.' },
      { t: 'Sanger trace viewer', d: 'Open .ab1 files, trim by quality and compare with a reference.' },
      { t: 'Protein analysis', d: 'Hydropathy, transmembrane and disorder profiles, charge and composition.' },
      { t: 'Alignment and dot plots', d: 'Pairwise alignment with affine gaps and dot plots for repeats and rearrangements.' },
    ],
    useCases: ['Planning a cloning experiment', 'Checking primers before ordering', 'Verifying a construct from Sanger reads', 'Teaching molecular biology with real sequences'],
    inputs: st('sequence').inputs, outputs: ['Annotated maps and gel images', 'Primer lists (CSV)', 'Assembled construct sequences (FASTA/GenBank-style)', 'Alignments'],
    engine: st('sequence').engines, limits: st('sequence').limits,
    seoTitle: 'Sequence Studio: Online Primer Design, Cloning & Virtual Gel',
    seoDescription: 'Free online sequence analysis: ORF finder, restriction digest with virtual gel, primer design and in-silico PCR, Golden Gate and Gibson cloning, Sanger trace viewer.',
    keywords: ['online primer design tool', 'virtual gel electrophoresis', 'cloning simulator online', 'sanger trace viewer'],
  },
  {
    slug: 'genome-studio', name: 'Nayancode Genome Studio', line: 'Genomics & transcriptomics', studio: 'genome', app: st('genome').path, shot: shot('genome-studio'), courses: ['ngs-data-analysis', 'genome-assembly-annotation', 'bacterial-genomics-amr'],
    tagline: 'Real minimap2, samtools and bcftools, running in a browser tab.',
    short: 'Read QC, mapping and SNV and indel calling with minimap2, samtools and bcftools compiled to WebAssembly, bundled reference genomes and a genome browser.',
    description: ['Genome Studio runs genuine bioinformatics tools (minimap2, samtools and bcftools, compiled to WebAssembly) inside your browser. Stream FASTQ files for quality control, map reads to a reference, produce sorted BAM files, compute coverage and call SNVs and indels, then explore the result in the genome viewer. Reference genomes for E. coli K-12, B. subtilis 168, M. tuberculosis H37Rv, SARS-CoV-2 and phage lambda are bundled, with their annotations.', 'It also computes assembly statistics, BED interval algebra and MinHash similarity between genomes, making it a complete small-genome workspace for microbiology, teaching and quick checks.'],
    features: [
      { t: 'Streaming read QC', d: 'Quality, length and composition profiles for large FASTQ files without loading them into memory.' },
      { t: 'Mapping and variants', d: 'minimap2 + samtools + bcftools in WebAssembly: sorted BAM, coverage, SNV and indel calls exported as VCF, checked against the native tools on real E. coli reads.' },
      { t: 'Bundled genomes', d: 'RefSeq references and annotations for five model microbes and viruses, ready without a download.' },
      { t: 'Primers and CRISPR off-targets', d: 'Check primer specificity and search CRISPR guides for off-target sites against the loaded genome.' },
      { t: 'Genome browser', d: 'igv.js tracks for references, alignments, variants and annotations.' },
      { t: 'Assembly metrics', d: 'N50, L50, GC and length distributions for draft assemblies.' },
      { t: 'Interval algebra', d: 'Intersect, merge and subtract BED intervals.' },
      { t: 'Genome similarity', d: 'MinHash ANI estimates between genomes.' },
    ],
    useCases: ['Checking a bacterial isolate’s reads and variants', 'Teaching NGS analysis in a classroom', 'Quick QC before launching a cluster pipeline'],
    inputs: st('genome').inputs, outputs: ['QC plots', 'Sorted BAM and coverage', 'VCF', 'Assembly statistics'],
    engine: st('genome').engines, limits: st('genome').limits,
    seoTitle: 'Genome Studio: Online Read Mapping & Variant Calling (WASM)',
    seoDescription: 'Map reads and call SNVs and indels in your browser with minimap2, samtools and bcftools in WebAssembly. FASTQ QC, bundled genomes, VCF export, genome viewer.',
    keywords: ['online read mapping', 'minimap2 browser', 'FASTQ quality control online', 'variant calling online', 'bcftools online', 'CRISPR off-target search'],
  },
  {
    slug: 'variant-studio', name: 'Nayancode Variant Studio', line: 'Genomics & transcriptomics', studio: 'variant', app: st('variant').path, shot: shot('variant-studio'), courses: ['ngs-data-analysis', 'clinical-genomics-variant-interpretation', 'population-genomics-gwas'],
    tagline: 'From VCF to evidence, with nothing uploaded unless you ask.',
    short: 'VCF QC and filtering, somatic TMB and VAF, mutational signatures, public evidence lookups and GWAS plots.',
    description: ['Variant Studio explores VCF files on your own computer: quality summaries, flexible filters, somatic tumour-mutational-burden and allele-fraction views, and de novo mutational signatures extracted with non-negative matrix factorisation.', 'When you choose, it looks up public evidence for selected variants (ClinVar, CIViC, Open Targets and gnomAD) and annotates with Ensembl VEP. GWAS summary statistics become Manhattan and QQ plots in seconds.'],
    features: [
      { t: 'VCF QC and filters', d: 'Depth, quality, genotype and consequence filters with live counts.' },
      { t: 'Somatic views', d: 'Tumour mutational burden and variant-allele-fraction distributions.' },
      { t: 'Mutational signatures', d: 'De novo NMF extraction and refitting, without restricted reference catalogues.' },
      { t: 'Evidence on demand', d: 'ClinVar, CIViC, Open Targets and gnomAD lookups only for the variants you select.' },
      { t: 'GWAS plots', d: 'Manhattan and QQ plots from summary statistics.' },
    ],
    useCases: ['Reviewing variant calls from a pipeline', 'Exploring a tumour sample’s mutational processes', 'Teaching variant interpretation'],
    inputs: st('variant').inputs, outputs: ['Filtered VCF and tables', 'Signature profiles', 'Evidence summaries', 'GWAS figures'],
    engine: st('variant').engines, limits: st('variant').limits,
    seoTitle: 'Variant Studio: Online VCF Viewer, Filters & Signatures',
    seoDescription: 'Explore VCF files privately in your browser: QC and filters, somatic TMB and VAF, mutational signatures, ClinVar/CIViC/gnomAD lookups and GWAS Manhattan plots.',
    keywords: ['online VCF viewer', 'mutational signature analysis', 'Manhattan plot online', 'VCF filter tool'],
  },
  {
    slug: 'expression-studio', name: 'Nayancode Expression Studio', line: 'Genomics & transcriptomics', studio: 'expression', app: st('expression').path, shot: shot('expression-studio'), courses: ['rna-seq-data-analysis', 'r-for-bioinformatics', 'systems-biology-network-analysis'],
    tagline: 'Counts in, differential expression and pathways out.',
    short: 'Bulk RNA-seq from a count matrix: QC and PCA, ComBat batch correction, differential expression, volcano and heatmaps, ORA and GSEA.',
    description: ['Expression Studio takes a count matrix and a sample sheet and walks through a complete bulk RNA-seq analysis: sample QC and PCA, optional ComBat batch correction, differential expression with a moderated t-test, and interactive volcano, MA and heatmap figures.', 'Enrichment uses bundled, openly licensed pathway collections (Reactome, WikiPathways and GO) for over-representation and preranked GSEA, so it works offline.'],
    features: [
      { t: 'Sample QC and PCA', d: 'Library sizes, distributions and PCA to catch outliers and batch structure.' },
      { t: 'Batch correction', d: 'ComBat with before-and-after PCA and a corrected-matrix export.' },
      { t: 'Differential expression', d: 'Moderated t-statistics with Benjamini–Hochberg control.' },
      { t: 'Interactive figures', d: 'Volcano, MA and clustered heatmaps with gene search and export.' },
      { t: 'Pathway enrichment', d: 'ORA and preranked GSEA on Reactome, WikiPathways and GO, bundled offline.' },
    ],
    useCases: ['A first look at a new RNA-seq experiment', 'Teaching differential expression', 'Checking batch effects before a formal DESeq2 analysis'],
    inputs: st('expression').inputs, outputs: ['DE tables', 'Volcano, MA and heatmap figures', 'Enrichment tables', 'Corrected matrices'],
    engine: st('expression').engines, limits: st('expression').limits,
    seoTitle: 'Expression Studio: Online RNA-seq Differential Expression',
    seoDescription: 'Analyse RNA-seq count matrices in your browser: QC, PCA, ComBat batch correction, differential expression, volcano plots, heatmaps and GSEA on Reactome and GO.',
    keywords: ['online RNA-seq analysis', 'differential expression online tool', 'volcano plot generator', 'GSEA online'],
  },
  {
    slug: 'single-cell-studio', name: 'Nayancode Single-Cell & Spatial Studio', line: 'Genomics & transcriptomics', studio: 'singlecell', app: st('singlecell').path, shot: shot('single-cell-studio'), courses: ['single-cell-rna-seq-analysis', 'spatial-transcriptomics-analysis'],
    tagline: 'From matrix to annotated clusters, then into tissue space.',
    short: 'scRNA-seq QC, highly variable genes, PCA, graph clustering, UMAP or t-SNE, markers, annotation and spatial statistics.',
    description: ['Single-Cell & Spatial Studio performs the standard single-cell workflow in your browser: cell QC, highly variable genes, PCA, shared-nearest-neighbour Louvain clustering, UMAP or t-SNE embeddings, marker genes and annotation.', 'Add spatial coordinates to compute spatial autocorrelation (Moran’s I) and see where clusters and genes sit in the tissue.'],
    features: [
      { t: 'QC and feature selection', d: 'Counts, genes and mitochondrial fraction per cell; highly variable genes.' },
      { t: 'Clustering', d: 'SNN graph with Louvain community detection on all cells.' },
      { t: 'Embeddings', d: 'Clean-room UMAP and t-SNE implementations.' },
      { t: 'Markers and annotation', d: 'Ranked marker genes per cluster and manual annotation.' },
      { t: 'Spatial statistics', d: 'Moran’s I for spatially patterned genes.' },
    ],
    useCases: ['Exploring a small single-cell dataset', 'Teaching single-cell analysis', 'Checking a 10x matrix from nf-core/scrnaseq'],
    inputs: st('singlecell').inputs, outputs: ['Cluster assignments', 'Embeddings', 'Marker tables', 'Spatial statistics'],
    engine: st('singlecell').engines, limits: st('singlecell').limits,
    seoTitle: 'Single-Cell Studio: Online scRNA-seq Clustering & UMAP',
    seoDescription: 'Run single-cell RNA-seq analysis in your browser: QC, PCA, Louvain clustering, UMAP or t-SNE, marker genes and spatial statistics, with no installation.',
    keywords: ['online single cell analysis', 'UMAP online tool', 'scRNA-seq clustering browser'],
  },
  {
    slug: 'microbiome-studio', name: 'Nayancode Microbiome Studio', line: 'Evolution & microbiome', studio: 'microbiome', app: st('microbiome').path, shot: shot('microbiome-studio'), courses: ['microbiome-metagenomics-analysis', 'biodiversity-ecological-informatics'],
    tagline: 'Diversity, ordination and differential abundance, done properly.',
    short: 'Amplicon feature tables to alpha and beta diversity, UniFrac, PCoA, PERMANOVA, CLR differential abundance and rarefaction.',
    description: ['Microbiome Studio analyses amplicon feature tables with the methods microbial ecologists rely on: alpha diversity, Bray–Curtis and weighted or unweighted UniFrac distances, PCoA ordination, PERMANOVA tests and rarefaction curves.', 'Differential abundance uses centred log-ratio transformation, which respects the compositional nature of sequencing data.'],
    features: [
      { t: 'Alpha and beta diversity', d: 'Richness, Shannon and Simpson; Bray–Curtis and Jaccard distances.' },
      { t: 'UniFrac', d: 'Weighted and unweighted UniFrac with a phylogenetic tree.' },
      { t: 'Ordination and tests', d: 'PCoA with PERMANOVA on any metadata variable.' },
      { t: 'Compositional DA', d: 'CLR-based differential abundance.' },
      { t: 'Rarefaction', d: 'Curves to judge sequencing depth.' },
    ],
    useCases: ['Comparing microbial communities between conditions', 'Teaching microbiome analysis', 'Quick exploration before a QIIME 2 workflow'],
    inputs: st('microbiome').inputs, outputs: ['Diversity tables', 'Ordination plots', 'PERMANOVA results', 'DA tables'],
    engine: st('microbiome').engines, limits: st('microbiome').limits,
    seoTitle: 'Microbiome Studio: Online Diversity, UniFrac & PERMANOVA',
    seoDescription: 'Analyse amplicon microbiome data in your browser: alpha and beta diversity, UniFrac, PCoA, PERMANOVA, CLR differential abundance and rarefaction.',
    keywords: ['online microbiome analysis', 'UniFrac calculator', 'PERMANOVA online', 'alpha diversity tool'],
  },
  {
    slug: 'chemistry-studio', name: 'Nayancode Chemistry Studio', line: 'Chemistry & structure', studio: 'chemistry', app: st('chemistry').path, shot: shot('chemistry-studio'), courses: ['cheminformatics-qsar-modelling', 'python-for-cheminformatics', 'computer-aided-drug-design'],
    tagline: 'RDKit in your browser, with QSAR you can defend.',
    short: 'Compound curation, descriptors, similarity and substructure search, chemical space, Butina clustering and a validated QSAR lab.',
    description: ['Chemistry Studio runs RDKit compiled to WebAssembly: curate and standardise compound lists, compute descriptors and structural alerts, search by similarity and SMARTS, and map chemical space with Butina clusters.', 'Its QSAR Lab trains random-forest, k-nearest-neighbour and ridge models with cluster-based cross-validation, Y-randomisation and an applicability domain, then writes a model card. Compounds can be imported from PubChem and ChEMBL.'],
    features: [
      { t: 'Curation and descriptors', d: 'Standardisation, physicochemical descriptors and structural alerts.' },
      { t: 'Similarity and substructure', d: 'Morgan fingerprints with Tanimoto similarity; SMARTS search.' },
      { t: 'Chemical space', d: 'Projections with Butina clustering to see diversity and series.' },
      { t: 'QSAR Lab', d: 'RF, kNN and ridge models with cluster CV, Y-randomisation, applicability domain and a model card.' },
      { t: 'Data import', d: 'Retrieve compounds and activities from PubChem and ChEMBL.' },
    ],
    useCases: ['Triaging a compound library', 'Building a first QSAR model properly', 'Teaching cheminformatics without installation'],
    inputs: st('chemistry').inputs, outputs: ['Curated compound tables', 'Similarity hits', 'Cluster assignments', 'QSAR predictions and model card'],
    engine: st('chemistry').engines, limits: st('chemistry').limits,
    seoTitle: 'Chemistry Studio: Online RDKit, Similarity Search & QSAR',
    seoDescription: 'Cheminformatics in your browser with RDKit: curation, descriptors, similarity and SMARTS search, chemical space, Butina clustering and a validated QSAR lab.',
    keywords: ['online cheminformatics tool', 'RDKit online', 'QSAR model online', 'tanimoto similarity search'],
  },
  {
    slug: 'structure-studio', name: 'Nayancode Structure Studio', line: 'Chemistry & structure', studio: 'structure', app: st('structure').path, shot: shot('structure-studio'), courses: ['molecular-docking-drug-discovery', 'protein-structure-prediction-modelling', 'molecular-dynamics-simulations'],
    tagline: 'Proteins and ligands in 3D, with the measurements that matter.',
    short: 'Mol* viewing of PDB and AlphaFold structures with an interaction profiler, pocket detection, SASA and superposition with TM-score.',
    description: ['Structure Studio combines the Mol* viewer with analysis: load any PDB entry, an AlphaFold model by UniProt ID or your own file, and profile protein–ligand interactions, detect pockets, compute solvent-accessible surface area and superpose structures with RMSD and TM-score.', 'It is validated on the classic HIV-1 protease–inhibitor complex (PDB 1HSG) and documents its limits plainly: heavy-atom geometry only, and a heuristic pocket score.'],
    features: [
      { t: 'Mol* viewer', d: 'Publication-quality 3D views of structures and complexes.' },
      { t: 'Interaction profiler', d: 'Hydrogen bonds, hydrophobic contacts, salt bridges and π interactions.' },
      { t: 'Pocket detection', d: 'Grid-based pocket finding to suggest binding sites.' },
      { t: 'SASA', d: 'Per-residue and total solvent-accessible surface area.' },
      { t: 'Superposition', d: 'Kabsch superposition with RMSD and TM-score.' },
    ],
    useCases: ['Inspecting a docking pose', 'Comparing a predicted model with an experimental structure', 'Teaching structural biology'],
    inputs: st('structure').inputs, outputs: ['Interaction tables', 'Pocket lists', 'SASA tables', 'Superposition statistics and images'],
    engine: st('structure').engines, limits: st('structure').limits,
    seoTitle: 'Structure Studio: Online Protein Viewer & Interaction Profiler',
    seoDescription: 'View PDB and AlphaFold structures in your browser with Mol*, profile protein–ligand interactions, find pockets, compute SASA and superpose structures (TM-score).',
    keywords: ['online protein structure viewer', 'protein ligand interaction tool', 'pocket detection online', 'TM-score calculator'],
  },
  {
    slug: 'docking-studio', name: 'Nayancode Docking Studio', line: 'Chemistry & structure', studio: 'docking', app: st('docking').path, shot: shot('docking-studio'), courses: ['molecular-docking-drug-discovery', 'computer-aided-drug-design', 'cheminformatics-qsar-modelling'],
    tagline: 'AutoDock Vina 1.2.7, running in a browser tab.',
    short: 'Molecular docking with AutoDock Vina compiled to WebAssembly: receptor and ligand preparation, box set-up, poses, interactions and small virtual screens.',
    description: ['Docking Studio runs AutoDock Vina 1.2.7, compiled to WebAssembly, inside your browser. Load a receptor from the PDB, AlphaFold DB or a file, give ligands as SMILES, SDF, MOL2 or a PubChem name, and the studio prepares both (protonation at pH 7.4, Gasteiger charges, PDBQT, 3-D conformers), sets the box from a co-crystal ligand, residues or coordinates, and docks.', 'Poses open in a 3-D viewer with an interaction profile (hydrogen bonds, hydrophobic contacts, salt bridges). A redocking benchmark on 42 complexes puts 35.7 % of top poses within 2 Å of the crystal pose, with scores identical to native Vina on the same inputs.'],
    features: [
      { t: 'Real AutoDock Vina', d: 'Vina 1.2.7 in WebAssembly, multi-threaded when the browser allows it; scores match native Vina.' },
      { t: 'Receptor and ligand preparation', d: 'pH 7.4 protonation, Gasteiger charges and PDBQT, from PDB, AlphaFold DB, SMILES, SDF, MOL2 or PubChem.' },
      { t: 'Box set-up', d: 'From a co-crystal ligand, a list of residues or explicit coordinates.' },
      { t: 'Poses and interactions', d: '3-D pose viewer, affinity table, RMSD to a crystal pose and an interaction profile.' },
      { t: 'Small virtual screens', d: 'Dock up to 300 compounds and rank them, with results exported as CSV and SDF.' },
      { t: 'Validated', d: 'Redocking benchmark on 42 complexes, published with the source code.' },
    ],
    useCases: ['Docking a ligand into a target before ordering compounds', 'Teaching molecular docking in a classroom without installing software', 'Ranking a small set of analogues against a binding site'],
    inputs: st('docking').inputs, outputs: ['Docked poses (PDBQT, SDF)', 'Affinity table (CSV)', 'Interaction profile'],
    engine: st('docking').engines, limits: st('docking').limits,
    seoTitle: 'Docking Studio: AutoDock Vina Online, Free in Your Browser',
    seoDescription: 'Free online molecular docking with AutoDock Vina 1.2.7 in WebAssembly: receptor and ligand preparation, box set-up, poses, interactions and small virtual screens.',
    keywords: ['autodock vina online', 'molecular docking online free', 'online docking tool', 'virtual screening online'],
  },
  {
    slug: 'phylogenetics-studio', name: 'Nayancode Phylogenetics Studio', line: 'Evolution & microbiome', studio: 'phylo', app: st('phylo').path, shot: shot('phylogenetics-studio'), courses: ['phylogenetics-molecular-evolution', 'bacterial-genomics-amr'],
    tagline: 'Alignments and trees, from neighbour-joining to maximum likelihood.',
    short: 'Multiple alignment, conservation, NJ and UPGMA with bootstrap, maximum-likelihood trees with model selection, Newick import and export.',
    description: ['Phylogenetics Studio aligns sequences progressively, scores conservation and builds trees by neighbour-joining or UPGMA with bootstrap support, or by maximum likelihood under JC69, K80, HKY85 or Poisson models with optional gamma rate variation and AIC/BIC model selection.', 'Trees can be rooted, styled and exported as Newick or images for publication.'],
    features: [
      { t: 'Multiple alignment', d: 'Progressive alignment with conservation scoring.' },
      { t: 'Distance trees', d: 'Neighbour-joining and UPGMA with bootstrap support.' },
      { t: 'Maximum likelihood', d: 'Nucleotide and protein models, gamma rates and AIC/BIC selection.' },
      { t: 'Tree figures', d: 'Rooting, styling and export.' },
    ],
    useCases: ['Placing a new isolate in a phylogeny', 'Teaching tree-building methods', 'Quick trees for gene families'],
    inputs: st('phylo').inputs, outputs: ['Alignments', 'Trees (Newick)', 'Tree figures', 'Model-selection tables'],
    engine: st('phylo').engines, limits: st('phylo').limits,
    seoTitle: 'Phylogenetics Studio: Online Alignment & ML Trees',
    seoDescription: 'Build phylogenetic trees in your browser: multiple alignment, neighbour-joining and UPGMA with bootstrap, maximum-likelihood trees with model selection.',
    keywords: ['online phylogenetic tree maker', 'maximum likelihood tree online', 'multiple sequence alignment online'],
  },
  {
    slug: 'lab-studio', name: 'Nayancode Lab Studio', line: 'Knowledge & reporting', studio: 'lab', app: st('lab').path, shot: shot('lab-studio'), courses: ['molecular-biology-techniques', 'biostatistics-experimental-design', 'scientific-data-visualisation'],
    tagline: 'qPCR, dose–response and power calculations, checked against R.',
    short: 'Bench calculators: qPCR ΔΔCt and Pfaffl, 4PL / 5PL dose–response with IC50, and power and sample size, with publication-ready figures.',
    description: ['Lab Studio covers the calculations a wet lab does every week. qPCR relative quantification by ΔΔCt (Livak) or efficiency-corrected Pfaffl with several reference genes, geNorm stability, replicate outlier flags and statistics on ΔCt; standard-curve efficiency; 4PL and 5PL dose–response fits with IC50 confidence intervals; and power and sample size for t tests, ANOVA, proportions, survival and RNA-seq.', 'Every method is validated against the original papers and R packages (drc, pwr, RNASeqPower, gsDesign, NormqPCR), and every chart exports to SVG, PDF or 300 / 600 dpi PNG.'],
    features: [
      { t: 'qPCR ΔΔCt and Pfaffl', d: 'Multiple reference genes, geNorm, technical-replicate outliers, t-test or ANOVA on ΔCt.' },
      { t: 'Standard curves', d: 'Amplification efficiency and R² from a dilution series.' },
      { t: 'Dose–response', d: '4PL and 5PL fits with IC50, Hill slope and 95 % confidence intervals.' },
      { t: 'Power and sample size', d: 't tests, ANOVA, proportions, log-rank and RNA-seq designs.' },
      { t: 'Publication figures', d: 'SVG, PDF and 300 / 600 dpi PNG with colour-blind-safe palettes.' },
    ],
    useCases: ['Analysing a qPCR plate export', 'Reporting IC50 values with confidence intervals', 'Planning group sizes for a grant or ethics application'],
    inputs: st('lab').inputs, outputs: ['Fold-change tables', 'IC50 and curve parameters', 'Sample-size tables', 'Figures (SVG, PDF, PNG)'],
    engine: st('lab').engines, limits: st('lab').limits,
    seoTitle: 'Lab Studio: qPCR ΔΔCt, IC50 & Sample Size Calculators',
    seoDescription: 'Free qPCR ΔΔCt and Pfaffl calculator, 4PL / 5PL dose–response with IC50 confidence intervals, and power and sample size, validated against R.',
    keywords: ['qpcr delta delta ct calculator', 'ic50 calculator online', 'dose response curve fitting', 'sample size calculator'],
  },
  {
    slug: 'gene-atlas', name: 'Nayancode Gene Atlas', line: 'Knowledge & reporting', app: '/atlas', shot: shot('gene-atlas'), courses: ['bioinformatics-foundations', 'systems-biology-network-analysis'],
    tagline: 'What is publicly known about a gene, on one page.',
    short: 'Gene knowledge cards from openly licensed sources: function, structure, disease associations, cancer evidence and pathways.',
    description: ['Gene Atlas gathers what is publicly known about a human gene from openly licensed sources (UniProt, Open Targets, CIViC, Reactome, WikiPathways and GO) into one card: function, structure, disease associations, clinical cancer evidence and pathways.', 'Pathway membership is bundled for offline use; live lookups go only to the public databases you query.'],
    features: [{ t: 'One card per gene', d: 'Function, structure links, diseases, cancer evidence and pathways together.' }, { t: 'Open sources only', d: 'Every field comes from openly licensed databases, credited on the card.' }, { t: 'Links onward', d: 'Jump to the structure studio or the original records.' }],
    useCases: ['Getting up to speed on a gene quickly', 'Checking a candidate gene from an analysis', 'Teaching how biological databases connect'],
    inputs: ['HGNC gene symbol'], outputs: ['Gene knowledge card', 'Disease and pathway tables'],
    engine: 'Public REST APIs (Open Targets, UniProt, CIViC) plus bundled pathway collections', limits: 'Human genes; live lookups need an internet connection.',
    seoTitle: 'Gene Atlas: Gene Function, Disease & Pathway Lookup',
    seoDescription: 'Look up any human gene: function, structure, disease associations, cancer evidence and pathways from openly licensed sources, on one page.',
    keywords: ['gene lookup tool', 'gene function database', 'gene disease association lookup'],
  },
  {
    slug: 'report-builder', name: 'Nayancode Report Builder', line: 'Knowledge & reporting', app: '/report', shot: shot('report-builder'), courses: ['scientific-data-visualisation', 'research-methodology-scientific-writing'],
    tagline: 'Figures, methods and provenance in one exportable report.',
    short: 'Collect figures from any studio, add notes and export a self-contained HTML or PDF report with auto-written methods and references.',
    description: ['Report Builder turns an analysis session into a document. Collect figures from any studio with one click, order and caption them, add notes, and export a self-contained HTML report or print it to PDF.', 'The methods section is written automatically from the recorded provenance of each analysis, with software versions, parameters and references.'],
    features: [{ t: 'One-click figure capture', d: 'Camera buttons on every chart card.' }, { t: 'Auto-written methods', d: 'Generated from each analysis’s recorded provenance, with citations.' }, { t: 'Portable output', d: 'Self-contained HTML or PDF, with nothing hosted elsewhere.' }],
    useCases: ['Sharing results with a supervisor or collaborator', 'Keeping a reproducible record of an exploratory analysis', 'Preparing supplementary material'],
    inputs: ['Figures and analyses from the studios'], outputs: ['HTML report', 'PDF (via print)'],
    engine: 'Browser-side document generation', limits: 'Reports include figures and methods from the current browser session.',
    seoTitle: 'Report Builder: Reproducible Analysis Reports with Methods',
    seoDescription: 'Collect figures from Nayancode studios and export a self-contained report with auto-written methods, software versions and references.',
    keywords: ['reproducible analysis report', 'auto generated methods section', 'bioinformatics report tool'],
  },
  {
    slug: 'nf-core-import', name: 'Nayancode Pipeline Import', line: 'Platform', app: '/import', shot: shot('nf-core-import'), courses: ['reproducible-bioinformatics-pipelines', 'cloud-computing-for-bioinformatics'],
    tagline: 'Run the pipeline anywhere. Explore the results here.',
    short: 'Drop in nf-core outputs (rnaseq counts, scrnaseq matrices, sarek VCFs, MultiQC statistics) and hand them to the right studio.',
    description: ['Pipeline Import connects heavy pipelines with interactive exploration. Run nf-core pipelines on a laptop, a cluster or the cloud, then drop the output folder into your browser: merged RNA-seq counts, 10x matrices, sarek VCFs and MultiQC statistics are recognised, decompressed locally and passed to the matching studio.', 'Nothing is uploaded; gzip files are read in the browser.'],
    features: [{ t: 'Recognises nf-core outputs', d: 'rnaseq, scrnaseq, sarek and MultiQC.' }, { t: 'Local decompression', d: 'Reads .gz files in the browser.' }, { t: 'Hand-off to studios', d: 'Opens the data in the right studio, in memory.' }],
    useCases: ['Exploring pipeline results without R or Python', 'Sharing an analysis workflow with collaborators', 'Teaching with real pipeline output'],
    inputs: ['nf-core output files'], outputs: ['Data loaded in Expression, Single-cell or Variant Studio'],
    engine: 'Browser file APIs and streaming decompression', limits: 'Supports the nf-core output formats listed; others can be loaded directly in each studio.',
    seoTitle: 'Pipeline Import: Explore nf-core Results in the Browser',
    seoDescription: 'Load nf-core rnaseq, scrnaseq, sarek and MultiQC outputs into interactive studios in your browser, with nothing uploaded.',
    keywords: ['nf-core results viewer', 'explore nextflow output', 'nf-core rnaseq visualisation'],
  },
];

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const productPath = (slug: string) => `/nayancode/products/${slug}`;
export const LIVE_STUDIOS = STUDIOS.length;

export { LICENSING, PLATFORMS, ROADMAP } from './labels';
