// Vedicgen internships. Fees are in INR and exclusive of 18% GST (business decisions; see docs/PRICING-RESEARCH.md).
// Intake dates are set in INTAKES when announced; until then pages say that applications are reviewed on a rolling
// basis and the start date is confirmed in the offer letter.
import type { FigureKind } from '../figures';

export interface Option { label: string; weeks: number; fee: number }
export interface Internship {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  discipline: 'dry' | 'wet' | 'hybrid';
  mode: string;
  short: string;
  intro: string;
  about: string[];
  options: Option[];
  weekly: string;
  eligibility: string[];
  selection: string[];
  projects: string[];
  outcomes: string[];
  mentorship: string[];
  deliverables: string[];
  tools: string[];
  faq: { q: string; a: string }[];
  keywords: string[];
  figure: FigureKind;
  courses: string[];
}

const DRY_OPTS: Option[] = [{ label: '4 weeks', weeks: 4, fee: 6999 }, { label: '8 weeks', weeks: 8, fee: 12999 }, { label: '12 weeks', weeks: 12, fee: 17999 }, { label: '24 weeks (dissertation length)', weeks: 24, fee: 32999 }];
const WET_OPTS: Option[] = [{ label: '4 weeks', weeks: 4, fee: 14999 }, { label: '8 weeks', weeks: 8, fee: 24999 }, { label: '12 weeks', weeks: 12, fee: 34999 }, { label: '24 weeks (dissertation length)', weeks: 24, fee: 59999 }];

const MENTOR_DRY = ['A named mentor with research or industry experience in the track', 'A weekly one-to-one review of progress, code and results', 'Code review on every substantial change, through Git', 'A fortnightly group journal club and work-in-progress session', 'Written feedback at the mid-point and at the end'];
const MENTOR_WET = ['A named mentor who supervises your bench work directly', 'Daily check-ins at the bench and a weekly one-to-one review', 'Review of your laboratory notebook against good documentation practice', 'A fortnightly group journal club and data session', 'Written feedback at the mid-point and at the end'];
const DELIVER = ['A project report in the format of a short research paper', 'Your code repository or laboratory notebook, reviewed by your mentor', 'A final presentation to the mentor panel', 'A Vedicgen internship certificate with a unique verification ID', 'A letter of recommendation for interns whose work merits one'];
const SELECTION_CORE = ['Academic record and relevant coursework (no minimum percentage is applied mechanically; the whole application is read)', 'A statement of purpose of 150–300 words: what you want to learn, why this track and what you hope to do next', 'Evidence of initiative: projects, coursework, code, posters or laboratory experience, if you have any', 'Performance in a short, track-specific task (sent after screening)', 'A 20-minute online interview on your motivation and reasoning, not on memorised facts'];

const FEE_FAQ = { q: 'Is there a stipend, and what does the fee cover?', a: 'Vedicgen training internships are fee-based and do not pay a stipend. The fee covers mentorship, computing or laboratory resources, materials and the certificate. Fees are listed on this page and are exclusive of 18% GST.' };
const DATES_FAQ = { q: 'When can I start?', a: 'Applications are reviewed on a rolling basis. Start dates are offered in the first week of each month, subject to mentor availability, and confirmed in your offer letter. Apply at least three weeks before you want to start.' };
const CERT_FAQ = { q: 'Will I receive a certificate?', a: 'Yes. Interns who complete the project and the final presentation receive a Vedicgen internship certificate, issued by Solagene, with a unique ID that anyone can check on the verification page.' };
const UNI_FAQ = { q: 'Can my university count the internship for credit?', a: 'Many universities accept it. On request we provide a joining letter, a weekly attendance and progress record, and a completion letter in your institution’s format. Check your university’s requirements before applying.' };

export const INTERNSHIPS: Internship[] = [
  {
    slug: 'bioinformatics-genomics-internship', title: 'Bioinformatics & Genomics Research Internship', discipline: 'dry', mode: 'Remote (online)', figure: 'volcano', courses: ['ngs-data-analysis', 'rna-seq-data-analysis', 'single-cell-rna-seq-analysis'],
    seoTitle: 'Bioinformatics Internship (Remote, Mentored) | Vedicgen',
    seoDescription: 'Mentored remote bioinformatics internship: NGS, RNA-seq, single-cell and genome analysis projects on real public data, with weekly reviews and a verifiable certificate.',
    short: 'Analyse real sequencing data on a scoped research project with weekly expert review.',
    intro: 'Work on a defined genomics project, from raw public data to a written result, with a mentor who reviews your code and your reasoning every week. This is the closest experience to working in a computational genomics group.',
    about: ['Interns join a small cohort and are matched to a project in NGS variant analysis, bulk or single-cell transcriptomics, genome assembly or microbial genomics. Projects use public data so that results can be shown in a portfolio.', 'The first week covers set-up, data access and project planning. From then on you work in weekly cycles: plan, analyse, review and revise, ending with a report and a presentation.'],
    options: DRY_OPTS, weekly: 'About 20 hours a week, flexible around classes',
    eligibility: ['Students in the final year of B.Sc., B.Tech., M.Sc., M.Tech. or a PhD in life sciences, biotechnology, bioinformatics, microbiology, genetics or related fields; recent graduates are welcome', 'Basic familiarity with the Linux command line and either Python or R (or completion of a Vedicgen foundations course)', 'A laptop with at least 8 GB of RAM and a reliable internet connection'],
    selection: SELECTION_CORE,
    projects: ['Reproduce the differential-expression analysis of a published RNA-seq study and test its robustness', 'Characterise antimicrobial-resistance genes across public bacterial genomes', 'Annotate cell types in a public single-cell dataset and compare annotation methods', 'Benchmark two variant callers on a Genome in a Bottle sample'],
    outcomes: ['Plan and execute an analysis project end to end', 'Write reproducible, reviewed analysis code', 'Interpret results statistically and biologically', 'Communicate a project in writing and in a presentation'],
    mentorship: MENTOR_DRY, deliverables: DELIVER,
    tools: ['Linux and Bash', 'Python or R', 'Git', 'FastQC, STAR, Salmon, DESeq2, Scanpy, GATK', 'Nayancode Workbench'],
    faq: [FEE_FAQ, DATES_FAQ, CERT_FAQ, UNI_FAQ, { q: 'I have no bioinformatics experience. Can I apply?', a: 'Yes, if you have strong biology and are willing to learn quickly. We may recommend a foundations course first, or a 12-week internship that starts with a structured skills phase.' }],
    keywords: ['bioinformatics internship India', 'remote bioinformatics internship', 'genomics internship for students', 'NGS internship'],
  },
  {
    slug: 'computational-drug-discovery-internship', title: 'Computational Drug Discovery Internship', discipline: 'dry', mode: 'Remote (online)', figure: 'interaction', courses: ['molecular-docking-drug-discovery', 'cheminformatics-qsar-modelling', 'molecular-dynamics-simulations'],
    seoTitle: 'Computational Drug Discovery Internship (Docking, QSAR, MD)',
    seoDescription: 'Mentored remote internship in molecular docking, QSAR, molecular dynamics and virtual screening, with validated workflows, weekly reviews and a verifiable certificate.',
    short: 'Docking, QSAR and molecular dynamics on a validated research project.',
    intro: 'Work on a structure- or ligand-based drug-discovery project with the validation steps that make results credible: redocking, decoy enrichment, cluster-aware QSAR validation and replicate simulations.',
    about: ['Projects target public protein structures and bioactivity data, so that results can be shared. Every project includes a validation step before any new prediction is made, because that is what separates publishable work from docking scores.', 'Interns meet weekly with their mentor, present at a fortnightly group session and finish with a written report and presentation.'],
    options: DRY_OPTS, weekly: 'About 20 hours a week, flexible around classes',
    eligibility: ['Students in the final year of B.Pharm., M.Pharm., B.Sc., M.Sc., B.Tech. or M.Tech. in pharmacy, chemistry, biotechnology or bioinformatics; recent graduates and PhD students are welcome', 'Basic organic chemistry and protein biochemistry', 'Willingness to work on the command line (taught in week one if needed)'],
    selection: SELECTION_CORE,
    projects: ['Retrospective validation of docking protocols for a kinase target, with decoy enrichment', 'A QSAR model for a ChEMBL target with scaffold-split validation and an applicability domain', 'Replicate molecular-dynamics simulations to test a docked binding pose', 'A ligand-based virtual screen combining fingerprints and pharmacophores'],
    outcomes: ['Prepare targets and ligands and validate a docking protocol', 'Build and validate QSAR models without leakage', 'Run and analyse molecular-dynamics simulations', 'Report computational drug-discovery results with their limits'],
    mentorship: MENTOR_DRY, deliverables: DELIVER,
    tools: ['AutoDock Vina', 'RDKit', 'GROMACS', 'PyMOL', 'Open Babel', 'Nayancode Chemistry and Structure Studios'],
    faq: [FEE_FAQ, DATES_FAQ, CERT_FAQ, UNI_FAQ, { q: 'Will my work be published?', a: 'Publication is never promised. Where a project produces a result worth publishing, your mentor will discuss authorship and next steps openly with you.' }],
    keywords: ['drug discovery internship', 'molecular docking internship', 'computational chemistry internship India', 'pharmacy internship bioinformatics'],
  },
  {
    slug: 'ai-ml-biology-internship', title: 'AI & Machine Learning in Biology Internship', discipline: 'dry', mode: 'Remote (online)', figure: 'roc', courses: ['machine-learning-for-biology', 'deep-learning-genomics-drug-discovery', 'llms-for-life-sciences'],
    seoTitle: 'AI & Machine Learning in Biology Internship (Remote)',
    seoDescription: 'Mentored internship in machine learning and deep learning for biology and chemistry: honest validation, baselines, model cards and reproducible code.',
    short: 'Build and honestly evaluate ML models on biological and chemical data.',
    intro: 'Prototype and evaluate machine-learning models on biological data with the discipline that makes them trustworthy: strong baselines, leakage-free splits, uncertainty and a model card that states the limits.',
    about: ['Projects range from expression-based classifiers and sequence models to molecular property prediction and literature-mining tools. Each begins with a simple baseline and a validation design agreed with your mentor.', 'You finish with a reproducible repository, a model card and a presentation of what the model can and cannot do.'],
    options: DRY_OPTS, weekly: 'About 20 hours a week, flexible around classes',
    eligibility: ['Students in the final year of an undergraduate or postgraduate programme in computer science, data science, bioinformatics, biotechnology, statistics or engineering; recent graduates and PhD students are welcome', 'Working knowledge of Python and basic machine learning (scikit-learn level)', 'Interest in biology; biological background is taught as needed'],
    selection: SELECTION_CORE,
    projects: ['A cancer-subtype classifier from expression data with proper cross-validation', 'A CNN that predicts transcription-factor binding and an interpretation of what it learned', 'A molecular solubility model comparing fingerprints and graph neural networks', 'An LLM-based tool for extracting assay conditions from papers, with measured accuracy'],
    outcomes: ['Frame a biological prediction problem and choose a validation strategy', 'Build baselines and stronger models and compare them fairly', 'Quantify uncertainty and applicability', 'Document a model with a model card'],
    mentorship: MENTOR_DRY, deliverables: DELIVER,
    tools: ['Python', 'scikit-learn', 'PyTorch', 'RDKit', 'Jupyter', 'Git'],
    faq: [FEE_FAQ, DATES_FAQ, CERT_FAQ, UNI_FAQ],
    keywords: ['AI in biology internship', 'machine learning bioinformatics internship', 'data science internship biotech'],
  },
  {
    slug: 'bio-it-cloud-data-engineering-internship', title: 'Bio-IT, Cloud & Data Engineering Internship', discipline: 'dry', mode: 'Remote (online)', figure: 'workflow', courses: ['devops-for-scientific-software', 'cloud-computing-for-bioinformatics', 'data-engineering-fair-data'],
    seoTitle: 'Bio-IT & Cloud Data Engineering Internship (Remote)',
    seoDescription: 'Mentored internship in bioinformatics pipelines, cloud computing, DevOps and data engineering for life-science organisations, with production-style code review.',
    short: 'Pipelines, cloud, DevOps and data platforms for life-science organisations.',
    intro: 'Bio-IT teams build the pipelines, cloud platforms and data systems that research depends on. This internship gives you production-style experience: tested code, containers, infrastructure as code and documentation.',
    about: ['Projects include Nextflow pipelines, containerised tools, cloud deployment templates and FAIR data pipelines, built with continuous integration and reviewed like production code.', 'You learn the engineering habits that bio-IT employers look for and leave with a public repository that demonstrates them.'],
    options: DRY_OPTS, weekly: 'About 20 hours a week, flexible around classes',
    eligibility: ['Students in the final year of B.Tech., B.E., BCA, MCA, M.Sc., M.Tech. or related programmes in computing, bioinformatics or biotechnology; recent graduates are welcome', 'Comfort with Linux, Git and one programming language', 'Interest in life-science data; biology is taught as needed'],
    selection: SELECTION_CORE,
    projects: ['A tested Nextflow pipeline with CI and container images', 'A cost-controlled cloud deployment of an nf-core pipeline', 'A metadata-validation and ingestion pipeline for sequencing sample sheets', 'Infrastructure-as-code templates for a small genomics environment'],
    outcomes: ['Build tested, containerised pipelines', 'Deploy and monitor workloads in the cloud', 'Design data pipelines with validation and metadata', 'Write documentation and runbooks others can follow'],
    mentorship: MENTOR_DRY, deliverables: DELIVER,
    tools: ['Nextflow', 'Docker', 'GitHub Actions', 'Terraform', 'AWS or Google Cloud', 'Python', 'DuckDB'],
    faq: [FEE_FAQ, DATES_FAQ, CERT_FAQ, UNI_FAQ, { q: 'Will I need to pay for cloud resources?', a: 'No. Projects use the internship sandbox or free tiers sized to stay within free limits.' }],
    keywords: ['bio-IT internship', 'cloud computing internship bioinformatics', 'data engineering internship life sciences', 'DevOps internship'],
  },
  {
    slug: 'geoinformatics-health-data-internship', title: 'Geoinformatics & Health Data Internship', discipline: 'dry', mode: 'Remote (online)', figure: 'composition', courses: ['gis-remote-sensing', 'spatial-epidemiology-health-gis', 'health-informatics-fhir'],
    seoTitle: 'Geoinformatics & Health Data Internship (GIS, Remote)',
    seoDescription: 'Mentored internship in GIS, remote sensing, spatial epidemiology and health-data standards, using open data with weekly reviews and a verifiable certificate.',
    short: 'Spatial analysis, remote sensing and health-data projects with open data.',
    intro: 'Apply GIS, remote sensing and health-data methods to questions in agriculture, ecology and public health, using open datasets and reproducible workflows.',
    about: ['Projects include crop and land-cover mapping from satellite imagery, access-to-care analyses, disease mapping with open data, and interoperable health-data pipelines with synthetic records.', 'You work in weekly cycles with a mentor and finish with maps, a report and a presentation.'],
    options: DRY_OPTS, weekly: 'About 20 hours a week, flexible around classes',
    eligibility: ['Students in the final year of programmes in geography, environmental science, agriculture, public health, life sciences, computing or engineering; recent graduates are welcome', 'Basic QGIS or Python, or completion of the Vedicgen GIS course'],
    selection: SELECTION_CORE,
    projects: ['Map crop condition through a season with Sentinel-2 NDVI', 'Measure travel time to primary health centres and identify underserved areas', 'Model the distribution of an endemic species from GBIF data', 'Convert laboratory records to FHIR with synthetic data'],
    outcomes: ['Process vector and satellite data reproducibly', 'Apply spatial statistics appropriately', 'Communicate spatial results with clear maps', 'Work with health-data standards and privacy controls'],
    mentorship: MENTOR_DRY, deliverables: DELIVER,
    tools: ['QGIS', 'Python (GeoPandas, Rasterio)', 'R (sf)', 'Copernicus data', 'HL7 FHIR test servers'],
    faq: [FEE_FAQ, DATES_FAQ, CERT_FAQ, UNI_FAQ],
    keywords: ['GIS internship', 'geoinformatics internship India', 'remote sensing internship', 'health informatics internship'],
  },
  {
    slug: 'scientific-software-engineering-internship', title: 'Scientific Software Engineering Internship (Nayancode)', discipline: 'dry', mode: 'Remote or hybrid', figure: 'heatmap', courses: ['scientific-web-applications', 'high-performance-scientific-programming', 'research-software-engineering'],
    options: [{ label: '12 weeks', weeks: 12, fee: 0 }, { label: '24 weeks', weeks: 24, fee: 0 }],
    seoTitle: 'Scientific Software Engineering Internship | Nayancode',
    seoDescription: 'Selective internship with Nayancode, Solagene’s software division: build features in browser-based scientific software with TypeScript, React, Rust and WebAssembly.',
    short: 'Ship features in Nayancode’s browser-based scientific software. Selective; no programme fee.',
    intro: 'Join the Nayancode engineering team and ship real features in scientific software used for genomics, transcriptomics, chemistry and structural biology: interfaces, visualisations, algorithms and tests.',
    about: ['Interns work on the Nayancode Workbench codebase: TypeScript and React interfaces, canvas and WebGL visualisation, algorithms in Web Workers, and Rust or C++ compiled to WebAssembly. Every change goes through code review and automated tests.', 'This internship is selective and carries no programme fee. Places depend on the engineering roadmap and are limited in each intake.'],
    weekly: 'About 30 hours a week',
    eligibility: ['Students in the final year of B.Tech., B.E., BCA, MCA, M.Sc., M.Tech. or a PhD in computer science, bioinformatics or a related field; strong self-taught developers are welcome', 'Solid programming in TypeScript/JavaScript, Python, Rust or C++, with code you can show', 'Genuine interest in science; biology is taught as needed'],
    selection: ['Code you have written: a repository, project or contribution you can walk us through', 'A take-home engineering task that mirrors real work on the codebase', 'A technical interview focused on reasoning, testing and communication', 'A conversation about the features you would like to build and why'],
    projects: ['A new interactive visualisation in a Nayancode studio', 'Performance work: moving a kernel to Rust and WebAssembly', 'Accessibility and keyboard support across a studio', 'A clean-room implementation of a published algorithm with tests against known answers'],
    outcomes: ['Ship reviewed features to production scientific software', 'Write tests that keep numerical code correct', 'Work in a professional engineering workflow', 'Build a portfolio of merged contributions'],
    mentorship: ['A senior engineer as your mentor', 'Daily asynchronous updates and a weekly one-to-one', 'Code review on every pull request', 'Design reviews for larger features'],
    deliverables: ['Merged pull requests in the Nayancode codebase', 'A short engineering write-up of your main feature', 'A final demo to the team', 'An internship certificate with a verification ID', 'A letter of recommendation for interns whose work merits one'],
    tools: ['TypeScript', 'React', 'Vite', 'Web Workers', 'Rust', 'WebAssembly', 'Vitest', 'Playwright'],
    faq: [{ q: 'Is there a fee or a stipend?', a: 'There is no programme fee. Any stipend is stated in the offer letter for the intake.' }, DATES_FAQ, CERT_FAQ, { q: 'Do I need to know biology?', a: 'No. You will learn the science behind the features you build from the team and the documentation.' }],
    keywords: ['software engineering internship bioinformatics', 'scientific software internship', 'React Rust WebAssembly internship India'],
  },
  {
    slug: 'molecular-biology-genetic-engineering-internship', title: 'Molecular Biology & Genetic Engineering Internship (Wet Lab)', discipline: 'wet', mode: 'In person', figure: 'gel', courses: ['molecular-biology-techniques', 'gene-cloning-recombinant-dna', 'qpcr-gene-expression'],
    seoTitle: 'Molecular Biology Wet Lab Internship (Hands-on)',
    seoDescription: 'Hands-on molecular biology internship: DNA and RNA work, PCR, qPCR, cloning and protein expression on a mentored bench project with a verifiable certificate.',
    short: 'A mentored bench project in PCR, qPCR, cloning and protein expression.',
    intro: 'Work at the bench on a scoped molecular-biology project with a mentor who supervises your technique, your notebook and your data. You perform every experiment yourself.',
    about: ['The internship starts with a safety induction and a skills phase (pipetting, solutions, nucleic-acid work), then moves to a project such as building and verifying a construct, measuring gene expression or expressing and purifying a protein.', 'All work uses non-pathogenic material. You keep a laboratory notebook to professional standards and finish with a report and presentation.'],
    options: WET_OPTS, weekly: 'Full-time at the bench, Monday to Friday',
    eligibility: ['Students in the final year of B.Sc., B.Tech., M.Sc., M.Tech. or a PhD in biotechnology, molecular biology, biochemistry, microbiology, genetics or related fields; recent graduates are welcome', 'Undergraduate molecular biology; prior bench experience helps but is not required', 'Participants must be 18 or older and complete the safety induction'],
    selection: SELECTION_CORE,
    projects: ['Clone and verify a reporter construct and confirm it by sequencing', 'Measure the expression of stress-response genes by qPCR', 'Express and purify a His-tagged fluorescent protein', 'Optimise a difficult PCR and document the troubleshooting'],
    outcomes: ['Perform core molecular-biology techniques independently', 'Plan experiments with appropriate controls', 'Keep a professional laboratory notebook', 'Analyse and present bench data'],
    mentorship: MENTOR_WET, deliverables: DELIVER,
    tools: ['Thermal cyclers and real-time PCR', 'Electrophoresis and gel documentation', 'Spectrophotometers', 'Centrifuges and incubators', 'Biosafety cabinets'],
    faq: [FEE_FAQ, DATES_FAQ, CERT_FAQ, UNI_FAQ, { q: 'Is accommodation provided?', a: 'No. The internship is held in person at our laboratory, and participants arrange their own accommodation and travel. The laboratory address and joining instructions are in the offer letter.' }],
    keywords: ['wet lab internship India', 'molecular biology internship', 'biotechnology internship India', 'genetic engineering internship'],
  },
  {
    slug: 'microbiology-bioprocess-internship', title: 'Microbiology & Bioprocess Internship (Wet Lab)', discipline: 'wet', mode: 'In person', figure: 'growth', courses: ['microbiology-techniques', 'industrial-microbiology-fermentation', 'analytical-techniques-hplc'],
    seoTitle: 'Microbiology & Fermentation Internship (Hands-on)',
    seoDescription: 'Hands-on microbiology and bioprocess internship: isolation, identification, growth, fermentation, product recovery and analytics on a mentored project.',
    short: 'Isolation, fermentation and analytics on a mentored microbiology project.',
    intro: 'Apply microbiology and bioprocess techniques to a real question, such as screening environmental isolates for an enzyme activity or optimising a fermentation, with close supervision at the bench.',
    about: ['After induction and a skills phase, you run a project that combines isolation and identification, growth and fermentation, and quantitative analysis of the product.', 'All organisms are Risk Group 1. You keep a professional notebook and present your results at the end.'],
    options: WET_OPTS, weekly: 'Full-time at the bench, Monday to Friday',
    eligibility: ['Students in the final year of B.Sc., B.Tech., M.Sc. or M.Tech. in microbiology, biotechnology, food technology or biochemical engineering; recent graduates are welcome', 'Undergraduate microbiology', 'Participants must be 18 or older and complete the safety induction'],
    selection: SELECTION_CORE,
    projects: ['Screen soil isolates for extracellular enzyme activity and characterise the best producer', 'Optimise media for a fermentation in shake flasks', 'Compare growth kinetics of a production strain under different conditions', 'Quantify a fermentation product by HPLC'],
    outcomes: ['Isolate, identify and maintain microorganisms', 'Run and monitor fermentations', 'Quantify products and calculate yields', 'Report results to a professional standard'],
    mentorship: MENTOR_WET, deliverables: DELIVER,
    tools: ['Biosafety and laminar-flow cabinets', 'Incubators and shakers', 'Benchtop bioreactor', 'Spectrophotometer', 'HPLC'],
    faq: [FEE_FAQ, DATES_FAQ, CERT_FAQ, UNI_FAQ],
    keywords: ['microbiology internship India', 'fermentation internship', 'bioprocess internship India'],
  },
  {
    slug: 'cell-culture-assays-internship', title: 'Cell Culture & Cell-Based Assays Internship (Wet Lab)', discipline: 'wet', mode: 'In person', figure: 'plate', courses: ['animal-cell-culture', 'cell-based-assays', 'elisa-immunoassays'],
    seoTitle: 'Cell Culture Internship (Hands-on Wet Lab)',
    seoDescription: 'Hands-on cell culture internship: aseptic culture, viability and cytotoxicity assays, apoptosis staining and ELISA on a mentored screening project.',
    short: 'Culture, dose–response and ELISA readouts on a mentored screening project.',
    intro: 'Maintain cell lines and run a small screening project with viability, cytotoxicity and protein readouts, under close supervision and with rigorous plate design and analysis.',
    about: ['After induction and an aseptic-technique phase, you design and run a dose–response study with appropriate controls, add an apoptosis or ELISA readout, and analyse the results statistically.', 'Work uses established, non-hazardous cell lines. You finish with a report and presentation.'],
    options: WET_OPTS, weekly: 'Full-time at the bench, Monday to Friday',
    eligibility: ['Students in the final year of B.Sc., B.Tech., M.Sc., M.Tech., B.Pharm. or M.Pharm. in biotechnology, life sciences, pharmacy or biomedical sciences; recent graduates are welcome', 'Undergraduate cell biology', 'Participants must be 18 or older and complete the safety induction'],
    selection: SELECTION_CORE,
    projects: ['A dose–response and IC50 study of a reference compound across two cell lines', 'Compare MTT and resazurin readouts for the same treatments', 'Quantify a secreted protein by ELISA after treatment', 'Optimise seeding density and plate layout for a screening assay'],
    outcomes: ['Maintain cell lines aseptically', 'Design and run plate-based assays', 'Fit dose–response curves and report IC50 values with uncertainty', 'Present cell-based results to publication standards'],
    mentorship: MENTOR_WET, deliverables: DELIVER,
    tools: ['Biosafety cabinets and CO₂ incubators', 'Inverted and fluorescence microscopes', 'Microplate reader', 'Curve-fitting software'],
    faq: [FEE_FAQ, DATES_FAQ, CERT_FAQ, UNI_FAQ],
    keywords: ['cell culture internship India', 'cell biology internship', 'pharmacology internship India'],
  },
  {
    slug: 'integrated-wet-dry-research-internship', title: 'Integrated Wet + Dry Research Internship', discipline: 'hybrid', mode: 'Hybrid: laboratory + remote analysis', figure: 'coverage', courses: ['molecular-biology-techniques', 'qpcr-gene-expression', 'rna-seq-data-analysis'],
    options: [{ label: '8 weeks', weeks: 8, fee: 22999 }, { label: '12 weeks', weeks: 12, fee: 29999 }, { label: '24 weeks (dissertation length)', weeks: 24, fee: 49999 }],
    seoTitle: 'Wet Lab + Bioinformatics Internship (Hybrid)',
    seoDescription: 'Hybrid internship combining bench work in our laboratory with bioinformatics analysis: generate data with PCR and qPCR, then analyse expression or sequencing data.',
    short: 'Generate data at the bench, then analyse it: the combination employers find hardest to hire.',
    intro: 'Generate data at the bench and analyse it yourself. This internship combines a laboratory phase with a remote analysis phase, so that you understand data from the sample onwards.',
    about: ['A typical project begins with RNA isolation and qPCR at the bench and continues with analysis of a matched public RNA-seq dataset, connecting what you measured with what genome-wide data show.', 'You keep a laboratory notebook and a code repository and present an integrated result at the end.'],
    weekly: 'Laboratory phase full-time; analysis phase about 20 hours a week',
    eligibility: ['Students in the final year of B.Sc., B.Tech., M.Sc., M.Tech. or a PhD in biotechnology, life sciences or bioinformatics; recent graduates are welcome', 'Undergraduate molecular biology and basic computer skills', 'Participants must be 18 or older and complete the safety induction'],
    selection: SELECTION_CORE,
    projects: ['Measure stress-response genes by qPCR and compare them with a public RNA-seq dataset', 'Validate RNA-seq differential-expression hits by qPCR', 'Characterise an isolate in the lab and analyse its public genome'],
    outcomes: ['Perform core bench techniques', 'Analyse matching data computationally', 'Relate bench decisions to data quality', 'Present an integrated wet–dry result'],
    mentorship: [...MENTOR_WET.slice(0, 2), 'A dry-lab mentor for the analysis phase with weekly code review', 'Fortnightly group journal club', 'Written feedback at the mid-point and at the end'], deliverables: DELIVER,
    tools: ['Real-time PCR and electrophoresis', 'Linux, R or Python', 'DESeq2 or Galaxy', 'Git'],
    faq: [FEE_FAQ, DATES_FAQ, CERT_FAQ, UNI_FAQ],
    keywords: ['wet lab and dry lab internship', 'biotechnology bioinformatics internship', 'hybrid internship India'],
  },
  {
    slug: 'dissertation-project-programme', title: 'Dissertation & Major Project Programme', discipline: 'hybrid', mode: 'Remote, in-person or hybrid', figure: 'workflow', courses: ['research-methodology-scientific-writing', 'biostatistics-experimental-design'],
    options: [{ label: 'Dry lab, 12 weeks', weeks: 12, fee: 17999 }, { label: 'Dry lab, 24 weeks', weeks: 24, fee: 32999 }, { label: 'Wet lab, 12 weeks', weeks: 12, fee: 34999 }, { label: 'Wet lab, 24 weeks', weeks: 24, fee: 59999 }],
    seoTitle: 'M.Sc. & B.Tech. Dissertation Project: Biotech, Bioinformatics',
    seoDescription: 'Supervised dissertation and major-project programme for M.Sc., B.Tech., M.Tech. and M.Pharm. students in bioinformatics and biotechnology, dry lab or wet lab.',
    short: 'A supervised final-year dissertation in bioinformatics or biotechnology, dry or wet lab.',
    intro: 'Complete your degree’s dissertation or major project under expert supervision, with a defined question, a realistic plan and the documentation your university requires.',
    about: ['We agree a project with you (and your internal guide, where your university requires it) before you start, plan it in phases, and support you through experiments or analysis, writing and the final viva presentation.', 'You write your own dissertation. Mentors guide, review and give feedback; they do not write for you.'],
    weekly: 'Dry lab: about 20–25 hours a week; wet lab: full-time at the bench',
    eligibility: ['Students in the final year (or final semester) of M.Sc., M.Tech., B.Tech., B.E., M.Pharm. or B.Pharm. programmes in the life sciences, biotechnology, bioinformatics, microbiology, pharmacy or related fields', 'A no-objection or project-permission letter from your institution, where your university requires one', 'A topic area of interest; specific topics are agreed during selection'],
    selection: [...SELECTION_CORE.slice(0, 3), 'A short discussion of your topic interests and your university’s dissertation requirements', 'Availability for the required duration'],
    projects: ['Differential expression and pathway analysis of a public disease dataset', 'Docking and QSAR study with full validation for a therapeutic target', 'Isolation and characterisation of enzyme-producing environmental microbes', 'qPCR-based gene-expression study of a stress response'],
    outcomes: ['Plan and complete an independent research project', 'Analyse and interpret data rigorously', 'Write a dissertation to your university’s requirements', 'Present and defend your work in a viva'],
    mentorship: ['A named supervisor matched to your topic', 'A weekly one-to-one meeting and written feedback on drafts', 'Liaison with your internal guide where required', 'A mock viva before your final presentation'],
    deliverables: ['A dissertation written by you, with supervisor feedback on drafts', 'Your data, code or laboratory notebook', 'A completion letter and attendance record in your institution’s format', 'A Vedicgen certificate with a unique verification ID'],
    tools: ['As required by the project'],
    faq: [FEE_FAQ, DATES_FAQ, { q: 'Will you write my dissertation or guarantee a publication?', a: 'No. You write your own dissertation, and we do not sell or guarantee publications. We supervise, review and help you do work you can defend.' }, UNI_FAQ],
    keywords: ['MSc dissertation project bioinformatics', 'BTech biotechnology project', 'final year project biotechnology India', 'MPharm project docking'],
  },
  {
    slug: 'summer-research-internship', title: 'Summer & Winter Research Internship', discipline: 'hybrid', mode: 'Remote (dry lab) or in-person (wet lab)', figure: 'gc', courses: ['bioinformatics-foundations', 'essential-laboratory-skills'],
    options: [{ label: 'Dry lab, 4 weeks', weeks: 4, fee: 6999 }, { label: 'Dry lab, 6 weeks', weeks: 6, fee: 9999 }, { label: 'Wet lab, 4 weeks', weeks: 4, fee: 14999 }, { label: 'Wet lab, 6 weeks', weeks: 6, fee: 19999 }],
    seoTitle: 'Summer Internship for Biotech & Bioinformatics Students',
    seoDescription: 'Short summer and winter research internships for biotechnology, life-science and bioinformatics students: a mentored mini-project in the dry lab or the wet lab.',
    short: 'A four- to six-week mentored mini-project during your summer or winter break.',
    intro: 'Use your summer or winter break to experience research: a short, structured mini-project with skills training at the start and a presentation at the end.',
    about: ['Short internships begin with a skills week (computational or laboratory), followed by a mini-project designed to be completed in the time available, and a final presentation.', 'They suit second- and third-year students who want early research experience before choosing a specialisation or a longer internship.'],
    weekly: 'Dry lab: about 20 hours a week; wet lab: full-time at the bench',
    eligibility: ['Students in the second year or later of B.Sc., B.Tech., B.Pharm. or an integrated M.Sc. in life sciences, biotechnology, bioinformatics, microbiology or related fields', 'For wet-lab places: participants must be 18 or older and complete the safety induction'],
    selection: SELECTION_CORE.slice(0, 2).concat(['A short conversation about your interests and availability']),
    projects: ['Explore a public gene-expression dataset and identify changed pathways', 'Find and characterise open reading frames and protein domains in a bacterial genome segment', 'Isolate DNA, amplify a gene by PCR and confirm it on a gel', 'Prepare media and isolate pure microbial cultures from an environmental sample'],
    outcomes: ['Experience a complete, small research project', 'Learn core computational or bench skills', 'Present a project clearly', 'Decide on a direction for further study'],
    mentorship: ['A named mentor and a weekly one-to-one review', 'Group sessions with other interns', 'Written feedback at the end'], deliverables: ['A short project report', 'A final presentation', 'A Vedicgen internship certificate with a unique verification ID'],
    tools: ['As required by the mini-project'],
    faq: [FEE_FAQ, { q: 'When do summer and winter internships run?', a: 'Summer internships usually start between May and July, and winter internships in December or January. Exact start dates are confirmed in your offer letter.' }, CERT_FAQ, UNI_FAQ],
    keywords: ['summer internship biotechnology', 'summer internship bioinformatics India', 'winter internship biotech students'],
  },
];

export const internshipBySlug = (slug: string) => INTERNSHIPS.find((x) => x.slug === slug);
export const internshipPath = (slug: string) => `/vedicgen/internships/${slug}`;
export const internshipFrom = (x: Internship) => Math.min(...x.options.map((o) => o.fee));

export { INTERN_PROCESS } from './labels';

/** INTAKE DETAILS, set when announced, e.g. { next: '2027-01-04', deadline: '2026-12-10' }. */
export const INTAKES: { next: string | null; deadline: string | null } = { next: null, deadline: null };
