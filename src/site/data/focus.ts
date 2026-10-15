// Vivofold's company focus: what we work on (FOCUS), what partners can buy from us (SOLUTIONS) and where the field is
// heading (LANDSCAPE, from the October 2026 market review in docs/MARKET-RESEARCH.md). Written at positioning level and
// without inflated claims: nothing here claims a pipeline asset, partner, dataset or result. Edit freely.

export type Glyph = 'molecule' | 'design' | 'omics' | 'target' | 'platform' | 'modalities';

export interface FocusArea {
  slug: string; n: string; glyph: Glyph; title: string; kicker: string; short: string;
  capabilities: string[]; links: { label: string; to: string }[];
}

export const FOCUS: FocusArea[] = [
  {
    slug: 'generative-ai-physics-drug-discovery', n: '01', glyph: 'molecule', kicker: 'Small-molecule discovery',
    title: 'Generative AI & physics-based drug discovery',
    short: 'Generative models explore chemical space; physics-based simulation decides which ideas deserve a chemist’s time.',
    capabilities: ['Structure- and ligand-based design', 'Docking and virtual screening', 'Molecular dynamics and free-energy methods', 'QSAR, ADMET and synthesisability models', 'Active learning from assay data'],
    links: [{ label: 'Docking & virtual screening', to: '/services/molecular-docking-virtual-screening' }, { label: 'QSAR & cheminformatics', to: '/services/qsar-cheminformatics' }, { label: 'Research area', to: '/research/structural-biology-drug-discovery' }],
  },
  {
    slug: 'de-novo-molecular-protein-design', n: '02', glyph: 'design', kicker: 'Design from first principles',
    title: 'De novo molecular & protein design',
    short: 'Computational design of new molecules and proteins against a defined target profile, ranked with the same physical models we use in discovery.',
    capabilities: ['Target-profile driven design workflows', 'Computational ranking of candidates', 'Design-to-assay feedback with partner laboratories'],
    links: [{ label: 'Talk to us about a project', to: '/contact' }],
  },
  {
    slug: 'multi-omics-spatial-biology', n: '03', glyph: 'omics', kicker: 'Systems biology',
    title: 'Multi-omics integration & spatial biology',
    short: 'Genomes, transcriptomes, proteomes and tissue maps analysed together, so a signal is checked from several angles before anyone acts on it.',
    capabilities: ['Bulk, single-cell and spatial transcriptomics', 'Proteomics and metabolomics', 'Batch correction and cross-assay integration', 'Pathway and network analysis', 'Reproducible, documented pipelines'],
    links: [{ label: 'Multi-omics integration', to: '/services/multi-omics-integration' }, { label: 'Single-cell analysis', to: '/services/single-cell-analysis' }, { label: 'Research area', to: '/research/genomics-transcriptomics' }],
  },
  {
    slug: 'first-in-class-target-discovery', n: '04', glyph: 'target', kicker: 'Novel biology',
    title: 'First-in-class target discovery',
    short: 'Evidence-ranked target hypotheses from human genetics, perturbation data and biological networks, with the uncertainty stated.',
    capabilities: ['Human-genetics and expression evidence', 'Network and knowledge-graph prioritisation', 'Target dossiers with ranked evidence', 'Experimental validation plans'],
    links: [{ label: 'Machine learning for biology', to: '/services/machine-learning-biology' }, { label: 'Research area', to: '/research/ai-machine-learning-biology' }],
  },
  {
    slug: 'ai-platform-biopharma', n: '05', glyph: 'platform', kicker: 'Platform',
    title: 'AI platform for biopharma',
    short: 'One reproducible platform from raw data to decision: pipelines, models, dashboards and reports that a discovery team can rerun and audit.',
    capabilities: ['Data engineering and FAIR data', 'Versioned pipelines and models', 'Cloud and high-compute workflows', 'Browser-based analysis through Nayancode'],
    links: [{ label: 'Nayancode software', to: '/nayancode' }, { label: 'Data engineering & FAIR data', to: '/services/data-engineering-fair-data' }],
  },
  {
    slug: 'novel-biologic-design', n: '06', glyph: 'modalities', kicker: 'Next-generation modalities',
    title: 'Novel biologics: ADCs, mRNA, cell & gene therapy',
    short: 'Computational and data-analysis support for programmes in antibody–drug conjugates, mRNA medicines and cell and gene therapy, delivered with partner laboratories.',
    capabilities: ['Target and biomarker evaluation', 'Patient-stratification analysis', 'Developability and CMC data analysis'],
    links: [{ label: 'Talk to us about a project', to: '/contact' }],
  },
];

export interface Solution { slug: string; group: string; title: string; short: string; to: string; cta: string }
export const SOLUTION_GROUPS = [
  { id: 'discovery', title: 'AI drug-discovery partnerships', lede: 'Discovery work done for you, or with your team.' },
  { id: 'data', title: 'Data, biomarkers & clinical genomics', lede: 'The analyses that turn samples and sequence into evidence.' },
  { id: 'infra', title: 'Infrastructure & operations', lede: 'The compute, systems and process work behind a programme.' },
] as const;
export const SOLUTIONS: Solution[] = [
  { slug: 'contract-ai-drug-discovery', group: 'discovery', title: 'Contract AI drug discovery', short: 'Hit finding and optimisation campaigns that combine generative models with physics-based ranking.', to: '/services/molecular-docking-virtual-screening', cta: 'Docking & screening' },
  { slug: 'contract-cadd-qsar', group: 'discovery', title: 'Contract CADD & QSAR modelling', short: 'Docking, pharmacophore, QSAR and ADMET models, validated and delivered with code and a methods section.', to: '/services/qsar-cheminformatics', cta: 'QSAR service' },
  { slug: 'proprietary-ai-models', group: 'discovery', title: 'Proprietary AI models', short: 'Models trained on a partner’s own assay data and kept for that partner’s programme.', to: '/contact', cta: 'Discuss a model' },
  { slug: 'computational-oncology', group: 'discovery', title: 'Computational oncology pipelines', short: 'Tumour sequencing, expression and spatial analyses from raw data to a reviewable report.', to: '/services/wgs-wes-variant-analysis', cta: 'Variant analysis' },
  { slug: 'ngs-pipelines', group: 'data', title: 'Robust NGS pipelines', short: 'Validated, versioned pipelines for DNA and RNA sequencing that run the same way every time.', to: '/services/custom-pipelines-consulting', cta: 'Pipelines' },
  { slug: 'clinical-variant-interpretation', group: 'data', title: 'Clinical variant interpretation', short: 'Annotation and evidence-based classification of variants for research and trial use, with a documented method.', to: '/services/wgs-wes-variant-analysis', cta: 'WGS / WES' },
  { slug: 'pharmacogenomics', group: 'data', title: 'Pharmacogenomics', short: 'Genotype-to-drug-response analysis for research cohorts and trial sub-studies.', to: '/contact', cta: 'Ask us' },
  { slug: 'biomarker-strategy', group: 'data', title: 'Clinical-trial biomarker strategy', short: 'Biomarker discovery, assay selection and analysis plans that support patient stratification.', to: '/services/multi-omics-integration', cta: 'Multi-omics' },
  { slug: 'genomic-surveillance', group: 'data', title: 'Genomic surveillance', short: 'Pathogen and resistance genomics pipelines for public-health and hospital laboratories.', to: '/services/microbiome-microbial-genomics', cta: 'Microbial genomics' },
  { slug: 'data-generation', group: 'data', title: 'Large-scale structural & multi-omics data generation', short: 'Purpose-built datasets for training and validating models, produced with partner laboratories.', to: '/contact', cta: 'Discuss' },
  { slug: 'cloud-workflows', group: 'infra', title: 'High-compute cloud workflows', short: 'Scalable cloud and HPC set-ups for simulation, sequencing and model training, built to control cost.', to: '/services/cloud-hpc-infrastructure', cta: 'Cloud & HPC' },
  { slug: 'bio-it-infrastructure', group: 'infra', title: 'Bio-IT infrastructure', short: 'FAIR data platforms, LIMS and ELN integration and secure analysis environments for life-science teams.', to: '/services/data-engineering-fair-data', cta: 'Data engineering' },
  { slug: 'bioprocess-optimisation', group: 'infra', title: 'Bioprocess optimisation', short: 'Data-driven design-of-experiments and modelling for fermentation and cell-culture processes.', to: '/contact', cta: 'Discuss' },
  { slug: 'hybrid-cro-cdmo', group: 'infra', title: 'Hybrid CRO / CDMO services', short: 'Computational design paired with wet-lab execution through our laboratory and partner sites, under one project plan.', to: '/contact', cta: 'Discuss' },
];

export interface Fact { tag: string; title: string; text: string; src: string; url: string }
export const LANDSCAPE: Fact[] = [
  { tag: 'Deals', title: 'Partnerships are multiplying, but headline value is not cash', text: 'Industry trackers count 114 AI/ML drug-discovery partnerships signed in 2025 (84 in 2024) and about $45.9 billion in headline value in the first half of 2026, of which roughly $1.9 billion was committed upfront.', src: 'IntuitionLabs deal tracker', url: 'https://intuitionlabs.ai/articles/big-pharma-hyperscaler-ai-deals-tracker-2026' },
  { tag: 'Small molecules', title: 'AI-enabled small-molecule discovery attracts large pharma', text: 'Takeda’s collaboration with Iambic Therapeutics is valued at more than $1.7 billion, covering oncology and gastrointestinal targets.', src: 'IntuitionLabs deal tracker', url: 'https://intuitionlabs.ai/articles/big-pharma-hyperscaler-ai-deals-tracker-2026' },
  { tag: 'Physics + AI', title: 'Open models now approach free-energy accuracy, and hybrids follow', text: 'Boltz-2, released openly by MIT and Recursion, predicts binding affinity at accuracy approaching free-energy calculations while running far faster. Recursion researchers then published a pipeline that feeds it into absolute binding free-energy methods.', src: 'BioPharmaTrend; Bio-IT World', url: 'https://www.bio-itworld.com/news/2025/10/10/boltz-upgrade--recursion-researchers-release-pipeline-combining-ai-binding-model-with-absolute-binding-free-energies' },
  { tag: 'Spatial & multi-omics', title: 'Foundation models for tissue and “virtual cells”', text: 'GSK committed $50 million upfront to license Noetik’s cancer foundation models, trained on roughly 40 million cells from over 1,000 patient tumours to predict spatial gene expression.', src: 'BioPharmaTrend', url: 'https://www.biopharmatrend.com/news/noetik-unveils-octo-vc-and-celleporter-to-build-foundation-models-for-spatial-biology-and-advance-cancer-immunotherapy-1079/' },
  { tag: 'Platforms', title: 'Buyers want platforms, not single tools', text: 'Large pharma is moving to longer-term arrangements that integrate data, models and workflows. Merck signed a $1 billion multi-year agreement with Google Cloud, and Lilly is building an AI supercomputer with NVIDIA.', src: 'IntuitionLabs deal tracker', url: 'https://intuitionlabs.ai/articles/big-pharma-hyperscaler-ai-deals-tracker-2026' },
  { tag: 'Agents', title: 'Agentic AI moves from pilot to production', text: 'In May 2026 Incyte announced a collaboration to deploy Edison Scientific’s Kosmos AI scientist across its discovery and development work.', src: 'IntuitionLabs', url: 'https://intuitionlabs.ai/articles/agentic-ai-pharma-rd-incyte-kosmos' },
  { tag: 'Data', title: 'Data is becoming a product', text: 'Ginkgo Bioworks now sells curated biological datasets designed for pre-training and fine-tuning AI models.', src: 'IntuitionLabs', url: 'https://intuitionlabs.ai/articles/ai-biologics-discovery-pharma-investment-trends' },
  { tag: 'Biologics', title: 'Biologics and gene-therapy design draw capital', text: 'AI antibody discovery startup Earendil Labs announced an $787 million private round in March 2026, and Astellas exercised its option on an AI-designed gene-delivery capsid from Dyno Therapeutics in April 2026.', src: 'IntuitionLabs; Business Wire', url: 'https://www.businesswire.com/news/home/20260408079855/en/Dyno-Therapeutics-Announces-Capsid-License-Exercised-by-Astellas-for-Skeletal-Muscle-Targeted-Gene-Delivery-Validating-AI-Powered-Technology-for-Biological-Sequence-Design' },
  { tag: 'India', title: 'Computational biotech is growing across Indian cities', text: 'Biotecnika reports a rise in computational biotech startups in several Indian metros, backed by Indian and global investors.', src: 'Biotecnika, March 2026', url: 'https://www.biotecnika.org/2026/03/ai-in-drug-discovery-startups-career-paths-2026' },
];
export const LANDSCAPE_CAUTION = 'Most figures above are company-reported or come from industry trackers and press releases, not audited filings. Commentators describe 2026 as the year clinical results, not announcements, become the test.';
export const IMPLICATIONS = [
  { t: 'Pair AI with physics', d: 'Fast learned models for exploration, rigorous simulation for the decisions that cost money.' },
  { t: 'Sell evidence, not scores', d: 'Every ranking arrives with its method, its uncertainty and code a partner can rerun.' },
  { t: 'Be a platform partner', d: 'Pipelines, data engineering and models that plug into a partner’s systems.' },
  { t: 'Stay close to the bench', d: 'Computational designs only matter once an assay agrees, so we plan the wet-lab loop from day one.' },
];
