var e=[{slug:`wet-lab-vs-dry-lab`,title:`Wet lab vs dry lab: the difference, and which skills you need`,seoTitle:`Wet Lab vs Dry Lab: Differences, Skills & Careers`,description:`What happens in a wet lab and a dry lab, the skills each needs, why the best life scientists understand both, and where to start.`,category:`Careers`,published:`2026-10-14`,body:`"Wet lab" and "dry lab" describe two ways of doing biology. In a wet lab you handle samples, reagents and instruments; in a dry lab you work with data, models and code. Modern life science needs both, and the scientists who are most in demand understand how each side shapes the other. This guide explains the difference, the skills each requires and how to decide where to start.

## What happens in a wet lab

A wet lab is a laboratory where experiments are performed on biological material: DNA, RNA, proteins, cells, microorganisms or tissues. The work is called "wet" because it involves liquids: buffers, media, reagents and samples.

Typical wet-lab techniques include:

- **Nucleic-acid work:** DNA and RNA isolation, PCR, quantitative PCR (qPCR), gel electrophoresis and cloning.
- **Protein work:** expression, purification, SDS-PAGE, Western blotting and enzyme assays.
- **Cell and tissue culture:** maintaining mammalian, microbial or plant cells under sterile conditions.
- **Microbiology:** isolation, staining, identification and growth measurements.
- **Analytical methods:** spectrophotometry, chromatography and immunoassays such as ELISA.

Good wet-lab practice is about accuracy, sterility, safety and documentation. A single pipetting error, a contaminated culture or a missing control can invalidate weeks of work.

## What happens in a dry lab

A dry lab is where biological questions are answered computationally. Bioinformaticians and computational biologists analyse sequencing data, model protein structures, screen molecules, build statistical and machine-learning models, and develop the software and pipelines that make this possible.

Typical dry-lab work includes:

- **Genomics and transcriptomics:** quality control, alignment, variant calling, RNA-seq and single-cell analysis.
- **Structural biology and drug discovery:** structure prediction, molecular docking, molecular dynamics and QSAR.
- **Statistics and machine learning:** experimental design, hypothesis testing and predictive models.
- **Engineering:** pipelines, cloud computing, databases and scientific software.

Dry-lab work is "wet" in a different way: it is only as good as the data and the assumptions behind it. Choosing the wrong statistical test, ignoring batch effects or leaking information between training and test sets produces confident but wrong answers.

## The difference in one table

| | Wet lab | Dry lab |
|---|---|---|
| Material | Samples, reagents, instruments | Data, code, models |
| Core skills | Technique, sterility, safety, documentation | Programming, statistics, reproducibility |
| Typical errors | Contamination, pipetting, missing controls | Wrong test, leakage, batch confounding |
| Output | Measurements, materials, observations | Analyses, predictions, software |
| Where | A laboratory | Anywhere with a computer |

## Why the best scientists understand both

Most modern projects cross the boundary. A gene-expression study starts with RNA isolation at the bench and ends with differential-expression analysis on a computer. A drug-discovery project moves between docking predictions and binding assays. Decisions on one side change what is possible on the other:

- **Experimental design** decides whether an analysis can separate the effect of interest from batch effects. A bioinformatician who understands the bench can spot a confounded design before samples are processed.
- **Data quality** depends on wet-lab choices such as RNA integrity, library preparation and sequencing depth. A bench scientist who can read a quality-control report can fix problems at the source.
- **Validation** often needs both: a computational prediction is confirmed by an experiment, and an unexpected experimental result is explained by re-analysing the data.

People who can speak both languages are rare, which is why "wet + dry" skills are valued in research institutes, biotech companies, diagnostics laboratories and CROs.

## Which should you learn first?

It depends on your background and goals.

- **If you are a biology or biotechnology student** with little coding experience, strengthen your bench skills and start learning the command line and Python or R in parallel. Our [Bioinformatics Foundations](/vedicgen/courses/bioinformatics-foundations) course assumes no programming.
- **If you already work in a lab**, learn to analyse your own data. [NGS Data Analysis with Galaxy](/vedicgen/courses/ngs-analysis-with-galaxy) teaches sequencing analysis without coding, and [Biostatistics & Experimental Design](/vedicgen/courses/biostatistics-experimental-design) covers the statistics behind sound experiments.
- **If you come from computer science or engineering**, learn enough biology to ask the right questions. [Molecular & Cell Biology Essentials](/vedicgen/courses/molecular-cell-biology-essentials) is designed for exactly that.
- **If you want both**, a combined programme is efficient. The [Bench-to-Bioinformatics Programme](/vedicgen/programs/bench-to-bioinformatics) takes you from RNA isolation and qPCR at the bench to RNA-seq analysis on the computer.

## Getting hands-on

Reading about techniques is not the same as performing them. For wet-lab skills, choose training where every participant works at the bench, not demonstrations watched from a distance. For dry-lab skills, choose courses that use real public datasets and end with a project you can show. Both kinds of evidence, a laboratory notebook and a code repository, carry weight with supervisors and employers.

You can also explore computational methods today, for free, in the [Nayancode Workbench](/nayancode/products/workbench), which runs analyses privately in your browser.
`,course:`bioinformatics-foundations`,keywords:[`wet lab vs dry lab`,`dry lab biology`,`wet lab skills`,`bioinformatics vs biotechnology`]},{slug:`qpcr-delta-delta-ct-method`,title:`qPCR data analysis: the ΔΔCt method with a worked example`,seoTitle:`qPCR ΔΔCt Method Explained (Worked Example)`,description:`What Ct values mean, how to calculate ΔCt, ΔΔCt and fold change step by step, the statistics to use, efficiency checks and MIQE.`,category:`Wet lab`,published:`2026-10-14`,body:`Quantitative PCR (qPCR) is the workhorse method for measuring gene expression, and the comparative Ct method, usually called **ΔΔCt** (delta-delta Ct), is the most common way to turn raw Ct values into fold changes. This guide explains what Ct values mean, walks through a complete ΔΔCt calculation with numbers, and lists the checks that make the result trustworthy.

## What a Ct value is

During qPCR, a fluorescent signal increases as the target is amplified. The **cycle threshold (Ct)**, also called the quantification cycle (Cq), is the cycle at which fluorescence crosses a threshold set in the exponential phase of amplification.

Two facts follow:

- **A lower Ct means more starting template.** A sample that crosses the threshold at cycle 20 had more target than one that crosses at cycle 25.
- **Ct is logarithmic.** With 100% amplification efficiency, the amount of product doubles every cycle, so a difference of one cycle corresponds to a two-fold difference in starting amount.

## The idea behind ΔΔCt

Relative quantification compares a **target gene** between a **treated** and a **control** condition. Two normalisations are needed:

1. **Normalise to a reference gene** (ΔCt) to correct for differences in the amount and quality of RNA and cDNA loaded in each well.
2. **Normalise to the control condition** (ΔΔCt) to express the result as a change relative to the baseline.

The formulas are:

\`\`\`text
ΔCt  = Ct(target) − Ct(reference)
ΔΔCt = ΔCt(treated) − ΔCt(control)
Fold change = 2^(−ΔΔCt)
\`\`\`

This method was described by Livak and Schmittgen (2001) and assumes that the target and reference genes amplify with similar efficiencies close to 100%.

## A worked example

Suppose you measure a stress-response gene in control and treated cells, with *GAPDH* as the reference gene. These are the mean Ct values of technical replicates for one biological replicate of each condition:

| Sample | Ct target | Ct GAPDH |
|---|---|---|
| Control | 26.4 | 18.2 |
| Treated | 23.9 | 18.0 |

**Step 1: ΔCt for each sample.**

- Control: 26.4 − 18.2 = 8.2
- Treated: 23.9 − 18.0 = 5.9

**Step 2: ΔΔCt.** 5.9 − 8.2 = −2.3

**Step 3: fold change.** 2^(2.3) ≈ 4.9

The target is about **4.9-fold higher** in treated cells than in controls.

## Do the statistics on ΔCt, not on fold changes

Biological replicates are what make a qPCR result meaningful. Calculate ΔCt for each biological replicate, compare the groups with an appropriate test on the ΔCt values (which are approximately normally distributed), and only then convert the mean difference and its confidence interval into fold-change units. Averaging fold changes directly distorts the result, because fold changes are not symmetric: a two-fold increase is 2.0, but a two-fold decrease is 0.5.

\`\`\`python
import numpy as np
from scipy import stats

dct_control = np.array([8.2, 8.5, 7.9])   # one value per biological replicate
dct_treated = np.array([5.9, 6.3, 5.6])

t, p = stats.ttest_ind(dct_treated, dct_control)
ddct = dct_treated.mean() - dct_control.mean()
print(f"fold change = {2 ** -ddct:.2f}, p = {p:.4f}")
\`\`\`

## When ΔΔCt is not appropriate

The 2^(−ΔΔCt) formula assumes amplification efficiencies close to 100% for both genes. Check this with a **standard curve**: run a dilution series of cDNA, plot Ct against log10 of the input, and calculate efficiency from the slope.

\`\`\`text
Efficiency (%) = (10^(−1/slope) − 1) × 100
\`\`\`

A slope of about −3.32 corresponds to 100% efficiency. Efficiencies between about 90% and 110% are generally acceptable. If the target and reference efficiencies differ substantially, use an efficiency-corrected model such as the Pfaffl method instead of plain ΔΔCt.

## Checks that make a qPCR result credible

- **Melt curves:** a single sharp peak for SYBR Green assays indicates one specific product; multiple peaks suggest primer dimers or non-specific amplification.
- **No-template controls (NTC):** should show no amplification, or amplification far later than samples.
- **No-RT controls:** reveal contamination by genomic DNA.
- **Reference-gene stability:** the reference gene should not change with the treatment. Validate it, or use the geometric mean of two or three reference genes.
- **Technical replicates:** should agree closely (a standard deviation of a few tenths of a cycle is typical); large spreads point to pipetting problems.
- **Reporting:** follow the MIQE guidelines (Bustin et al., 2009), which list the minimum information reviewers expect, from RNA quality to primer sequences and efficiency.

## Common mistakes

- Treating technical replicates as biological replicates.
- Using a reference gene that responds to the treatment.
- Interpreting Ct values above about 35 as reliable quantification.
- Averaging fold changes instead of ΔCt values.
- Ignoring efficiency differences between assays.

## Learn it at the bench

Analysing qPCR data well starts with generating it well. Our hands-on [Real-Time PCR (qPCR) & Gene Expression Analysis](/vedicgen/courses/qpcr-gene-expression) course takes you from RNA to cDNA to Ct values and fold changes, including standard curves, melt curves and MIQE reporting. For a quick start, the online [qPCR Data Analysis & MIQE workshop](/vedicgen/workshops#qpcr-data-analysis) focuses on the calculations.
`,course:`qpcr-gene-expression`,keywords:[`delta delta Ct method`,`qPCR data analysis`,`relative quantification qPCR`,`fold change calculation qPCR`]},{slug:`agarose-gel-electrophoresis-guide`,title:`Agarose gel electrophoresis: principle, protocol and troubleshooting`,seoTitle:`Agarose Gel Electrophoresis: Principle, Protocol & Tips`,description:`How agarose gel electrophoresis separates DNA and RNA, choosing the gel percentage, a general protocol, reading bands and fixing common problems.`,category:`Wet lab`,published:`2026-10-14`,body:`Agarose gel electrophoresis is the standard way to check DNA and RNA: whether a PCR worked, what size a fragment is, whether a plasmid digest gave the expected pattern, and whether RNA is intact. This guide explains how it works, gives a reliable general protocol and helps you troubleshoot the problems that appear most often.

## How it works

Nucleic acids carry a negative charge on their phosphate backbone. In an electric field they move towards the positive electrode (the anode). An agarose gel acts as a molecular sieve: small fragments move through the pores faster than large ones, so fragments separate by size.

Because migration distance is roughly linear with the logarithm of fragment size over the useful range of a gel, you can estimate the size of an unknown band by comparing it with a **DNA ladder** of known fragment sizes run on the same gel.

## Choosing the agarose percentage

The agarose concentration sets the pore size and therefore the range of fragment sizes that resolve well.

| Agarose (%) | Approximate resolving range |
|---|---|
| 0.7 | 0.8–10 kb |
| 1.0 | 0.5–8 kb |
| 1.5 | 0.2–3 kb |
| 2.0 | 0.1–2 kb |

For most PCR products of a few hundred base pairs, 1.5–2% gives sharp bands. For plasmids and large digests, 0.8–1% works better. These ranges are guides; buffer, voltage and run time also matter.

## A general protocol

**1. Prepare the gel.**

- Weigh agarose for the chosen percentage (for example, 1 g in 100 mL for a 1% gel) into running buffer (TAE or TBE).
- Heat until fully dissolved and clear, swirling carefully. Superheated agarose can boil over suddenly, so use heat-resistant gloves.
- Let it cool to about 55–60 °C, add a nucleic-acid stain according to the manufacturer’s instructions, pour into a casting tray with a comb, and let it set for 20–30 minutes.

**2. Load the samples.**

- Place the gel in the tank with the wells at the negative electrode (black) and cover it with running buffer.
- Mix each sample with loading dye, which adds density and tracking dyes.
- Load the ladder in the first (and ideally last) lane, then the samples, avoiding piercing the bottom of the well.

**3. Run the gel.**

- A common setting is 5–8 V per centimetre of distance between electrodes. Higher voltages run faster but heat the gel and can smear bands.
- Stop when the tracking dye has travelled about two-thirds to three-quarters of the gel.

**4. Image and interpret.**

- Visualise with the illumination appropriate for your stain and record the image with the lane annotations.
- Estimate fragment sizes against the ladder and compare them with the expected sizes.

## Interpreting common patterns

- **One sharp band of the expected size:** the PCR or digest worked as designed.
- **No band in the sample but a band in the positive control:** the sample reaction failed; check template quality and quantity.
- **A faint band at about 50 bp or below:** usually primer dimers.
- **Several bands:** non-specific amplification, partial digestion or a mixture of products.
- **Uncut plasmid shows several bands:** supercoiled, linear and nicked forms of the same plasmid migrate differently, with supercoiled DNA usually running fastest.
- **RNA:** intact total RNA from eukaryotic cells shows sharp 28S and 18S ribosomal bands, with the 28S band roughly twice as intense as the 18S; a smear towards small sizes suggests degradation.

## Troubleshooting

| Problem | Likely causes | What to try |
|---|---|---|
| Smeared bands | Overloading, degraded sample, high voltage | Load less, check integrity, lower the voltage |
| Faint or no bands | Too little DNA, stain missing or old, failed reaction | Load more, add fresh stain, run controls |
| Bands are fuzzy | Gel too warm, wrong percentage, old buffer | Lower voltage, choose a better percentage, fresh buffer |
| Ladder looks wrong | Ladder degraded or mis-loaded | Use fresh ladder at the recommended amount |
| Samples float out of wells | Not enough loading dye | Mix samples thoroughly with loading dye |
| Wavy or slanted bands | Uneven gel, wells damaged, uneven field | Pour on a level surface, load gently |

## Safety and good practice

- Wear gloves, a lab coat and eye protection, and follow your laboratory’s rules for the stain you use and for UV or blue-light transilluminators.
- Dispose of gels and buffers according to local waste rules.
- Record the gel percentage, buffer, voltage, run time, stain and ladder in your notebook with the image. Reviewers and colleagues need these to interpret the result.

## Practise it properly

Gel electrophoresis looks simple, but reading gels confidently comes from running many of them, including failed ones. Our [Molecular Biology Techniques](/vedicgen/courses/molecular-biology-techniques) course has every participant isolate DNA, run PCR and analyse their own gels, and the one-day [Hands-on PCR & Gel Electrophoresis](/vedicgen/workshops#hands-on-pcr-gel) workshop is a fast introduction. To predict the band pattern of a digest before you run it, try the free virtual gel in [Nayancode Sequence Studio](/nayancode/products/sequence-studio).
`,course:`molecular-biology-techniques`,tool:`restriction-site-finder`,keywords:[`agarose gel electrophoresis`,`gel electrophoresis protocol`,`gel electrophoresis troubleshooting`,`DNA gel percentage`]},{slug:`cell-culture-contamination`,title:`Cell culture contamination: prevention, detection and response`,seoTitle:`Cell Culture Contamination: Prevent, Detect, Respond`,description:`Bacterial, fungal, mycoplasma and cross-contamination in cell culture: how to recognise them, prevent them with aseptic technique, test for them and respond.`,category:`Wet lab`,published:`2026-10-14`,body:`Contamination is the most common reason cell-culture experiments fail. It wastes time and reagents and, worse, can produce misleading results without being noticed. This guide covers the main types of contamination, how to recognise them, how to prevent them and what to do when a culture is affected.

## Types of contamination

**Biological contaminants**

- **Bacteria:** the medium turns cloudy, often within a day or two, and may change colour (many media turn yellow as pH drops). Under the microscope you may see small moving particles between cells.
- **Yeast:** individual round or oval particles, sometimes budding; the medium becomes turbid more slowly.
- **Moulds (filamentous fungi):** visible filaments or fuzzy colonies, sometimes floating clumps.
- **Mycoplasma:** very small bacteria without a cell wall. They do not cause turbidity and are not visible with a standard microscope, yet they can change cell growth, metabolism and gene expression. They are detected only by testing.
- **Cross-contamination with other cell lines:** one cell line overgrows another. It is invisible without authentication and has affected published research.

**Chemical contaminants** include impurities in water or reagents, detergent residues and endotoxins, which can alter cell behaviour without visible signs.

## How to prevent contamination

**Work aseptically**

- Work in a certified biosafety cabinet that is switched on in advance, cleaned before and after use, and kept free of clutter.
- Wipe items with 70% ethanol before placing them in the cabinet.
- Do not pass hands or arms over open vessels; keep caps face down or held.
- Use sterile, individually wrapped pipettes and change them between reagents and cell lines.

**Organise the work**

- Handle one cell line at a time, and work with clean, low-passage stocks before older or less trusted cultures.
- Label everything clearly: cell line, passage number, date and initials.
- Aliquot media and reagents so that a contaminated bottle affects only a small volume.

**Maintain the environment**

- Clean incubators, water pans and centrifuges on a schedule, and record it.
- Keep humidifier water clean and follow manufacturer guidance on additives.
- Limit traffic and airflow disturbance around the cabinet.

**Think twice about antibiotics**

Routine antibiotics can hide low-level contamination and promote resistant organisms. Many laboratories maintain cells without antibiotics so that problems become visible early, using them only for specific purposes.

## How to detect contamination

- **Look every day:** check the colour and clarity of the medium and the morphology of the cells before working with them.
- **Test for mycoplasma regularly:** PCR-based kits, fluorescent DNA staining or enzymatic assays. Test new cell lines on arrival and on a routine schedule, for example every one to three months.
- **Authenticate cell lines:** short tandem repeat (STR) profiling confirms the identity of human cell lines and should be repeated when a line is established and at intervals.
- **Keep records:** a culture log with passage, observations and test results makes it possible to trace a problem to its source.

## What to do when a culture is contaminated

1. **Isolate it.** Close the vessel and move it away from other cultures.
2. **Discard it safely.** Decontaminate according to your laboratory’s biosafety rules, typically with disinfectant or autoclaving.
3. **Decontaminate the workspace,** including the cabinet, incubator and any shared equipment.
4. **Check the other cultures and reagents** handled at the same time, including media and supplements.
5. **Return to frozen stocks** from a known clean, authenticated bank.
6. **Record what happened** and what you changed.

Trying to rescue a contaminated culture is rarely worthwhile when clean stocks are available, and it risks spreading the problem.

## Build good habits early

Most contamination comes from routine handling, which is why aseptic technique is best learned by practising it repeatedly under supervision. Our hands-on [Animal Cell Culture Techniques](/vedicgen/courses/animal-cell-culture) course covers aseptic work, passaging, counting, cryopreservation and contamination control, and [Essential Laboratory Skills](/vedicgen/courses/essential-laboratory-skills) builds the foundations for any bench work.

*Further reading: Geraghty RJ et al. (2014). Guidelines for the use of cell lines in biomedical research. British Journal of Cancer 111:1021–1046.*
`,course:`animal-cell-culture`,keywords:[`cell culture contamination`,`mycoplasma contamination`,`aseptic technique cell culture`,`cell line authentication`]},{slug:`ngs-data-analysis-pipeline`,title:`NGS data analysis pipeline: from FASTQ to variants`,seoTitle:`NGS Data Analysis Pipeline: FASTQ to Variants (Guide)`,description:`The standard short-read pipeline step by step: QC, BWA alignment, duplicate marking, variant calling with GATK or DeepVariant, filtering and annotation.`,category:`Workflows`,published:`2026-10-14`,body:`Next-generation sequencing (NGS) produces millions of short reads. Turning them into reliable variant calls follows a well-established pipeline: quality control, alignment, post-processing, variant calling and filtering. This guide explains each step for short-read whole-genome or exome data, names the standard tools and highlights where analyses usually go wrong.

## The pipeline at a glance

\`\`\`text
FASTQ → QC & trimming → alignment (BAM) → sort, mark duplicates
      → base-quality recalibration (optional) → variant calling (VCF)
      → filtering → annotation → interpretation
\`\`\`

Production groups usually run these steps with a workflow manager such as **Nextflow**; the community pipeline **nf-core/sarek** implements a best-practice germline and somatic workflow.

## 1. Quality control

Run **FastQC** on every FASTQ file and summarise with **MultiQC**. Look at:

- per-base quality (Phred scores) along the read,
- adapter content,
- GC content and duplication levels,
- the number of reads per sample.

Trim adapters and very low-quality ends with **fastp** or **Trimmomatic** if needed. Aggressive trimming is rarely necessary for modern Illumina data and can remove useful sequence. Read more in our guide to [FASTQ format and Phred quality scores](/learn/fastq-format-phred-quality-scores).

## 2. Alignment to a reference genome

Align reads to a reference genome with **BWA-MEM** (or BWA-MEM2), the standard for short-read DNA. Use the same reference build throughout (for human, GRCh38) and record its exact version, including whether it contains alt contigs and decoys.

\`\`\`bash
bwa mem -t 8 -R '@RG\\tID:S1\\tSM:S1\\tPL:ILLUMINA' GRCh38.fa S1_R1.fq.gz S1_R2.fq.gz \\
  | samtools sort -o S1.sorted.bam
samtools index S1.sorted.bam
\`\`\`

The read-group line (\`-R\`) records the sample name and sequencing run; variant callers rely on it.

## 3. Post-processing

- **Mark duplicates** with Picard or GATK MarkDuplicates, so that PCR and optical duplicates do not inflate support for a variant.
- **Base-quality score recalibration (BQSR)** in GATK corrects systematic errors in base qualities using known variant sites. It is part of GATK best practice for germline calling.
- **Check alignment metrics:** mapping rate, insert-size distribution and coverage. For exomes, measure coverage over the target regions; for genomes, look at mean depth and evenness.

\`\`\`bash
samtools flagstat S1.sorted.bam
mosdepth -n --by targets.bed S1 S1.sorted.bam
\`\`\`

## 4. Variant calling

Common choices for germline small variants (SNVs and indels):

- **GATK HaplotypeCaller**, run per sample in GVCF mode and joint-genotyped across a cohort,
- **DeepVariant**, a deep-learning caller with strong benchmark performance,
- **FreeBayes** or **bcftools call** for simpler or non-human projects.

Somatic (tumour) calling needs different tools, such as **GATK Mutect2**, because tumour variants can be present at low allele fractions and must be distinguished from germline variants with a matched normal sample.

## 5. Filtering

Raw calls contain false positives. Filter them with:

- **GATK VQSR** for large cohorts, or **hard filters** on metrics such as quality by depth (QD), strand bias (FS, SOR) and mapping quality (MQ) for smaller studies,
- depth and genotype-quality thresholds appropriate to your coverage,
- region filters that exclude known problematic regions.

Measure the effect of your filters against a truth set where possible. The **Genome in a Bottle** benchmark samples provide high-confidence variant calls for exactly this purpose.

## 6. Annotation and interpretation

Annotate variants with their predicted consequence and population frequency using **Ensembl VEP** or **SnpEff**, adding gnomAD frequencies and ClinVar classifications as needed. Interpretation depends on the question: rare-disease studies filter by inheritance and rarity, population studies by frequency and association, cancer studies by known driver genes and allele fraction. Our guide to the [VCF file format](/learn/vcf-file-format-explained) explains how the results are written.

## Where analyses go wrong

- **Mixing reference builds** between alignment, calling and annotation.
- **Ignoring coverage:** a missing variant call in a region with no reads is not evidence of absence.
- **No benchmark:** without a truth set, you cannot know the sensitivity and precision of your pipeline.
- **Unrecorded versions and parameters:** results cannot be reproduced or defended.
- **Treating predictions as diagnoses:** research pipelines do not replace accredited clinical interpretation.

## Learn and practise

Our [NGS Data Analysis: WGS & WES](/vedicgen/courses/ngs-data-analysis) course teaches this pipeline end to end on real data, and [NGS Data Analysis with Galaxy](/vedicgen/courses/ngs-analysis-with-galaxy) covers the same steps without coding. You can map reads and call variants on small genomes, privately in your browser, with [Nayancode Genome Studio](/nayancode/products/genome-studio).
`,course:`ngs-data-analysis`,keywords:[`NGS data analysis pipeline`,`variant calling pipeline`,`GATK best practices`,`whole genome sequencing analysis`]},{slug:`autodock-vina-docking-tutorial`,title:`Molecular docking with AutoDock Vina: a step-by-step tutorial`,seoTitle:`AutoDock Vina Tutorial: Molecular Docking Step by Step`,description:`Prepare a receptor and ligand, define the search box, run AutoDock Vina, validate by redocking and interpret poses, using HIV-1 protease (1HSG).`,category:`Drug discovery`,published:`2026-10-14`,body:`AutoDock Vina is one of the most widely used free programs for molecular docking: predicting how a small molecule binds to a protein. This tutorial walks through a complete Vina run, from choosing a structure to reading the output, and shows how to check that your protocol works before you trust its predictions.

## What you need

- **AutoDock Vina** (version 1.2 or later), free and open source.
- **Open Babel** or **Meeko** to prepare ligands, and a viewer such as **PyMOL** or **UCSF ChimeraX**.
- A protein structure from the **RCSB PDB**, ideally one with a bound ligand in the site you care about.

In this example we use HIV-1 protease bound to the inhibitor indinavir, PDB entry **1HSG**, a classic teaching system because its binding mode is well known.

## Step 1: choose and inspect the structure

Before docking, look at the structure:

- **Resolution:** better than about 2.5 Å is preferable for docking.
- **Completeness:** check for missing residues or side chains near the binding site.
- **Ligands and waters:** note the co-crystallised ligand, which defines the binding site and lets you validate the protocol.
- **Biological assembly:** HIV-1 protease is a homodimer and the binding site lies between the two chains, so keep both.

## Step 2: prepare the receptor

1. Remove the co-crystallised ligand (save it separately; you will need it for validation) and, in most cases, water molecules.
2. Add hydrogens appropriate to physiological pH and check the protonation of key residues. In HIV-1 protease, the catalytic aspartates (Asp25 and Asp25′) deserve particular attention.
3. Convert the receptor to PDBQT format, which adds atom types and partial charges, using a preparation tool such as Meeko or AutoDockTools.

## Step 3: prepare the ligand

1. Start from a reliable structure, such as an SDF from PubChem or the extracted crystal ligand.
2. Add hydrogens, generate a sensible 3D conformation and assign rotatable bonds.
3. Convert to PDBQT.

\`\`\`bash
obabel ligand.sdf -O ligand.pdbqt -h --gen3d
\`\`\`

Tools such as Meeko handle protonation and torsions more carefully than a one-line conversion, which matters for drug-like molecules.

## Step 4: define the search box

Vina searches within a box. Centre it on the binding site, using the coordinates of the co-crystallised ligand, and make it large enough to contain the ligand with room to rotate, typically 20–25 Å per side for a drug-sized molecule.

\`\`\`text
receptor = receptor.pdbqt
ligand = ligand.pdbqt
center_x = 13.0
center_y = 22.5
center_z = 5.5
size_x = 22
size_y = 22
size_z = 22
exhaustiveness = 16
num_modes = 9
\`\`\`

The centre values above are illustrative; compute them from the ligand coordinates in your own file.

## Step 5: run Vina

\`\`\`bash
vina --config config.txt --out docked.pdbqt
\`\`\`

Vina reports a table of binding modes ranked by its scoring function, in kcal/mol, together with RMSD values between modes.

## Step 6: validate by redocking

The single most important check is **redocking**: dock the crystal ligand back into its own receptor and measure the root-mean-square deviation (RMSD) between the top-scoring pose and the crystal pose. An RMSD below about **2 Å** is the usual criterion that the protocol can reproduce a known binding mode.

If redocking fails, revisit the receptor preparation, protonation states, box size and exhaustiveness before docking anything new.

## Step 7: inspect the interactions

Open the receptor and the top poses in PyMOL or ChimeraX and examine:

- hydrogen bonds to key residues (for HIV-1 protease, the catalytic aspartates and the flap region),
- hydrophobic contacts and buried surface,
- clashes or unsatisfied polar groups.

A pose with a good score but implausible chemistry should not be trusted.

## What docking scores can and cannot tell you

- Vina scores are **approximate** and are best used to rank poses of one ligand and to prioritise compounds, not as accurate binding affinities.
- Comparing scores between very different molecules is unreliable; validate with **actives versus decoys** enrichment if you plan a virtual screen.
- Docking usually treats the receptor as rigid. Flexible regions, induced fit and water-mediated interactions are simplified.
- Promising poses can be tested further with molecular dynamics, and ultimately predictions need experimental confirmation.

For a deeper discussion of validation, see our guide to [validating a docking study](/learn/molecular-docking-validation).

## Go further

To learn docking properly, including target preparation, virtual screening and validation, see [Molecular Docking & Structure-Based Drug Discovery](/vedicgen/courses/molecular-docking-drug-discovery), or try the short online [Molecular Docking with AutoDock Vina workshop](/vedicgen/workshops#docking-autodock-vina). You can inspect protein–ligand interactions for free in [Nayancode Structure Studio](/nayancode/products/structure-studio).
`,course:`molecular-docking-drug-discovery`,keywords:[`AutoDock Vina tutorial`,`molecular docking tutorial`,`how to do molecular docking`,`redocking validation`]},{slug:`alphafold-plddt-pae-explained`,title:`How to read AlphaFold models: pLDDT, PAE and when to trust them`,seoTitle:`AlphaFold pLDDT and PAE Explained: When to Trust a Model`,description:`What AlphaFold’s pLDDT and PAE scores mean, how to read the PAE plot, and a checklist before using predicted structures for variants, mutations or docking.`,category:`Tutorials`,published:`2026-10-14`,body:`Predicted protein structures from AlphaFold are now available for almost every known protein, and it is easy to download one and start working with it. The model’s confidence scores tell you which parts to trust. This guide explains the two scores that matter most, **pLDDT** and **PAE**, and how to use them before you plan mutations, interpret variants or dock ligands.

## pLDDT: confidence in local structure

**pLDDT** (predicted local distance difference test) is a per-residue score from 0 to 100 that estimates how well the local structure around each residue is predicted. In AlphaFold DB files it is stored in the B-factor column, and viewers colour models by it.

A common interpretation, used by the AlphaFold Protein Structure Database, is:

| pLDDT | Interpretation |
|---|---|
| > 90 | Very high confidence: backbone and most side chains are usually reliable |
| 70–90 | Confident: the backbone is generally reliable |
| 50–70 | Low confidence: treat with caution |
| < 50 | Very low confidence: often disordered or unstructured in isolation |

Long stretches with pLDDT below 50 frequently correspond to **intrinsically disordered regions**. They are not errors to be fixed; they indicate that the region may not adopt a single stable structure on its own.

## PAE: confidence in relative positions

**PAE** (predicted aligned error) is a two-dimensional matrix. Each entry estimates the expected position error, in ångströms, at residue *x* when the predicted and true structures are aligned on residue *y*. Low values mean the relative position of two parts is confidently predicted.

PAE answers a question pLDDT cannot: **are the domains arranged correctly relative to each other?**

- A block of low PAE along the diagonal indicates a confidently predicted domain.
- Low PAE between two domains means their relative orientation is reliable.
- High PAE between two domains means each domain may be correct on its own, but their arrangement is uncertain.

A model can have high pLDDT in two domains and still place them in an arbitrary orientation; only the PAE shows this.

## A practical checklist before you use a model

1. **Colour by pLDDT.** Identify the confidently predicted core and the low-confidence regions.
2. **Open the PAE plot.** Identify domains and check whether inter-domain arrangement is confident.
3. **Compare with experiment.** If experimental structures exist in the PDB, superpose them and check agreement.
4. **Match the model to the task:**
   - *Interpreting a missense variant:* is the residue in a confident, structured region?
   - *Designing a mutation:* are the surrounding side chains confidently placed?
   - *Docking:* is the pocket formed by high-confidence residues, and are flexible loops near the site reliable? Apo models may not show induced-fit conformations.
5. **Record the version.** Note the AlphaFold DB version or the ColabFold settings you used.

## Complexes and ipTM

For protein complexes predicted with AlphaFold-Multimer or AlphaFold 3, the **ipTM** score summarises confidence in the interface. Low inter-chain PAE at the interface supports a confident interaction model; high values suggest the arrangement is uncertain. Interfaces should be treated as hypotheses to be tested.

## Common mistakes

- Treating low-pLDDT regions as structured and drawing conclusions from them.
- Ignoring PAE and trusting inter-domain distances.
- Docking into pockets lined by low-confidence loops without considering flexibility.
- Assuming a prediction captures ligand-bound, post-translationally modified or condition-specific states.

## Learn it hands-on

Our [Protein Structure Prediction & Modelling](/vedicgen/courses/protein-structure-prediction-modelling) course teaches homology modelling, AlphaFold and ColabFold, and the validation that tells you when a model is fit for purpose. The short [AlphaFold & Protein Structure Essentials workshop](/vedicgen/workshops#alphafold-structure-essentials) is a quick introduction. You can load any PDB entry or AlphaFold model by UniProt accession, and superpose structures, in [Nayancode Structure Studio](/nayancode/products/structure-studio).

*Reference: Jumper J et al. (2021). Highly accurate protein structure prediction with AlphaFold. Nature 596:583–589.*
`,course:`protein-structure-prediction-modelling`,keywords:[`AlphaFold pLDDT`,`PAE AlphaFold explained`,`AlphaFold confidence score`,`predicted protein structure`]},{slug:`choosing-a-bioinformatics-internship`,title:`How to choose a bioinformatics or biotech internship`,seoTitle:`Bioinformatics & Biotech Internship Guide for Students`,description:`Types of internship, what a good one looks like, questions to ask before you join or pay a fee, and how to write a strong application.`,category:`Careers`,published:`2026-10-14`,body:`An internship is often the step that turns coursework into research experience. Many students in India search for a bioinformatics or biotechnology internship every semester, and the options vary enormously in quality. This guide explains the main types of internship, what a good one looks like, and the questions to ask before you apply or pay a fee.

## Types of internship

- **Institute research internships and fellowships.** Research institutes and science academies run competitive summer programmes that place students with a faculty guide, sometimes with a stipend. Applications usually ask for academic records, a short statement of what you want to learn, and a recommendation from a teacher.
- **Direct placements with a faculty member.** Many institutes accept interns who write directly to a researcher. These are often unpaid and fee-free, and depend on the researcher’s capacity.
- **Industry internships.** Biotech, pharma, diagnostics and software companies take interns for defined projects, often for postgraduate students.
- **Structured training internships.** Private training providers offer fee-based internships that combine training with a mentored project. Quality varies widely, so evaluate them carefully.
- **Dissertation or major projects.** Final-year M.Sc., B.Tech. or M.Pharm. projects carried out at an external organisation, with your institution’s permission.

## What a good internship looks like

Whatever the type, strong internships share a few features:

1. **A defined project with a real question.** You should know, before you start, what you will work on and what a successful outcome looks like.
2. **A named mentor with relevant experience** who meets you regularly, reviews your work and gives written feedback.
3. **Hands-on work.** For wet-lab internships, you should perform experiments yourself at the bench, not only watch demonstrations. For dry-lab internships, you should write and run analyses on real data.
4. **Transparent selection.** A fair process reads your application, may set a small task and includes a conversation about your goals.
5. **Deliverables you can show:** a report, a laboratory notebook or a code repository, and a final presentation.
6. **Honest promises.** Nobody can guarantee a publication or a job. Be cautious of offers that do.

## Questions to ask before you join

- What exactly will I work on, and who will supervise me?
- How often will I meet my mentor, and how will my work be reviewed?
- Will I perform the experiments or analyses myself?
- What will I have at the end: a report, data, code, a certificate?
- Is there a fee or a stipend? What does the fee cover, and what is the refund policy?
- Who issues the certificate, and can it be verified?
- Can you provide the joining, attendance and completion letters my university needs?

## How to strengthen your application

- **Write a focused statement of purpose.** In 150–300 words, explain what you want to learn, why this track interests you and what you hope to do next. Specific is better than impressive.
- **Show evidence of initiative.** Coursework, a small analysis on public data, a poster or a code repository says more than a list of tools.
- **Prepare basic skills in advance.** For dry-lab internships, learn the Linux command line and some Python or R. For wet-lab internships, revise pipetting, solution preparation and sterile technique.
- **Be realistic about time.** Commit only to what you can sustain alongside your studies.

## Wet lab, dry lab or both?

If you are unsure which direction suits you, short internships are a low-risk way to find out. A computational internship can be done remotely; a wet-lab internship needs time in a laboratory. Hybrid internships, where you generate data at the bench and analyse it yourself, build the combination of skills that many employers find hardest to hire.

## Vedicgen internships

Vedicgen, the school of Vivofold, publishes the eligibility, selection criteria, procedure, fees, mentorship and deliverables for each of its [internship tracks](/vedicgen/internships), including bioinformatics, drug discovery, AI, Bio-IT, molecular biology, microbiology, cell culture, dissertation projects and short summer internships. Whichever programme you choose, use the questions above to compare your options.
`,keywords:[`bioinformatics internship India`,`biotech internship for students`,`how to choose an internship`,`summer internship biotechnology`]},{slug:`rna-seq-analysis-workflow`,title:`RNA-seq analysis workflow: from FASTQ to differentially expressed genes`,seoTitle:`RNA-seq Analysis Workflow: FASTQ to Differential Expression`,description:`A step-by-step guide to bulk RNA-seq analysis: experimental design, QC, quantification with STAR or Salmon, DESeq2 differential expression and enrichment.`,category:`Workflows`,published:`2026-10-14`,body:`RNA-seq measures which genes are expressed in a sample and how strongly. A typical project compares two or more conditions (treated and untreated cells, tumour and normal tissue, wild type and knockout) and asks which genes change. This article walks through the standard bulk RNA-seq workflow from raw reads to biological interpretation, explains what each step does and points out where analyses most often go wrong.

## 1. Start with the experimental design

Most RNA-seq problems are created before sequencing. Three decisions matter most:

- **Biological replicates.** Use independent samples (different animals, patients or separately grown cultures), not repeated measurements of one sample. Three per group is a practical minimum; more replicates add more statistical power than deeper sequencing does.
- **Avoid confounding.** If all treated samples are extracted on Monday and all controls on Friday, the batch and the treatment cannot be separated by any statistical method. Spread conditions across batches.
- **Depth and read type.** For gene-level differential expression in well-annotated organisms, around 20–30 million reads per sample is common. Isoform-level questions need more depth and benefit from paired-end reads.

## 2. Quality control of the reads

Run FastQC on every FASTQ file and combine the reports with MultiQC. Check per-base quality, adapter content and duplication. High duplication is normal in RNA-seq, because highly expressed genes produce many identical reads. Trim adapters and low-quality ends if needed with fastp or Trim Galore.

## 3. Quantify expression

There are two main routes.

| Approach | Tools | Output | When to use |
|---|---|---|---|
| Alignment + counting | STAR or HISAT2, then featureCounts | Reads per gene | When you also want BAM files for visualisation, splicing or variant work |
| Pseudo-alignment | Salmon or kallisto | Estimated counts and TPM per transcript | Fast, accurate gene and transcript quantification |

Both routes give a **count matrix**: genes as rows, samples as columns. If you use Salmon or kallisto, import the transcript estimates into R with \`tximport\` so that gene-level counts account for transcript length.

The nf-core/rnaseq pipeline runs these steps reproducibly and produces both a count matrix and a MultiQC report, which is a sensible default for many projects.

## 4. Explore the data before testing

Before any statistical test, check whether samples behave as expected.

- Apply a variance-stabilising transformation (\`vst\` or \`rlog\` in DESeq2). Raw counts are dominated by a few highly expressed genes.
- Plot a **PCA** of the samples. Replicates of the same condition should cluster together. If samples group by extraction date, sequencing lane or sex instead of condition, you have found a batch effect or a hidden variable.
- Look at sample-to-sample distance heatmaps and library sizes. A single outlier can distort the whole analysis.

## 5. Differential expression

DESeq2 and edgeR model counts with a negative binomial distribution, which handles the extra variability of biological replicates better than a t-test on normalised values. They also normalise for library size internally, so you give them raw counts, not TPM or FPKM.

\`\`\`r
library(DESeq2)
dds <- DESeqDataSetFromMatrix(counts, colData = samples, design = ~ batch + condition)
dds <- DESeq(dds)
res <- results(dds, contrast = c("condition", "treated", "control"), alpha = 0.05)
summary(res)
\`\`\`

Including \`batch\` in the design formula accounts for a known batch effect during testing. The output gives, for every gene, a log2 fold change, a p-value and an **adjusted p-value** controlling the false discovery rate. Use the adjusted value to decide significance, and consider fold-change shrinkage (\`lfcShrink\`) before ranking or plotting genes.

Visualise the results with an MA plot and a volcano plot, and check a few top genes with plots of their normalised counts per sample.

## 6. Interpret with enrichment analysis

A list of hundreds of genes is hard to interpret on its own. Enrichment analysis asks which biological processes or pathways are over-represented.

- **Over-representation analysis (ORA)** tests whether your significant genes include more members of a pathway than expected by chance. Use all tested genes as the background, not the whole genome.
- **Gene set enrichment analysis (GSEA)** ranks all genes by their statistic and asks whether a pathway's genes cluster at the top or bottom. It needs no significance cut-off and can detect coordinated small changes.

Common sources of gene sets are Gene Ontology, Reactome and MSigDB. Report the database version and the multiple-testing correction you used.

## 7. Report it reproducibly

A good methods section states software versions, the reference genome and annotation release, trimming parameters, the design formula and the significance thresholds. Keep the code: reviewers ask questions months later, and a script answers them in minutes.

## Where analyses usually go wrong

1. Too few biological replicates, or technical replicates treated as biological ones.
2. Batch confounded with condition.
3. Giving TPM or FPKM values to DESeq2 instead of raw counts.
4. Using raw p-values instead of adjusted p-values.
5. Using the whole genome as the background in ORA, which inflates significance.

## Learn and practise

Our RNA-seq Data Analysis course covers each of these steps hands-on with public datasets from GEO, ending with a full re-analysis of a published study. To see a differential-expression analysis and volcano plot running immediately, open the Expression Studio in our free Workbench, which works entirely in your browser.
`,course:`rna-seq-data-analysis`,keywords:[`RNA-seq analysis tutorial`,`RNA-seq workflow`,`DESeq2`]},{slug:`how-to-read-a-volcano-plot`,title:`How to read a volcano plot (and the mistakes reviewers catch)`,seoTitle:`How to Read a Volcano Plot: RNA-seq Results Explained`,description:`What the axes of a volcano plot mean, raw versus adjusted p-values, fold-change shrinkage, an R example and the most common interpretation mistakes.`,category:`Tutorials`,published:`2026-10-14`,body:`A volcano plot is the figure most people look at first after a differential-expression analysis. It shows thousands of genes at once and lets you see, in a single glance, which changed a lot and which changed reliably. It is also one of the most frequently misread figures in biology papers. This guide explains what each part of the plot means, how to read it correctly and the mistakes reviewers tend to catch.

## What the axes show

Each point is one gene (or protein, or metabolite).

- **The x-axis is the log2 fold change.** It measures the size of the difference between two conditions. A value of 1 means the gene is twice as high in the second condition, 2 means four times as high, and −1 means half as high. Using the log scale makes increases and decreases symmetric around zero.
- **The y-axis is −log10 of the p-value** (or, better, of the adjusted p-value). It measures how confident the test is that the difference is real rather than noise. A p-value of 0.01 becomes 2 on this axis, 0.001 becomes 3, and so on. Higher means stronger evidence.

The shape that gives the plot its name comes from the fact that large changes measured consistently across replicates produce small p-values, so the points spray up and outwards like an eruption.

## Reading the four regions

Most volcano plots draw a horizontal line at a significance threshold (for example adjusted p = 0.05, which is about 1.3 on the y-axis) and two vertical lines at a fold-change threshold (often |log2FC| = 1).

| Region | Meaning |
|---|---|
| Top right | Significantly higher in the second condition, with a large change |
| Top left | Significantly lower, with a large change |
| Top centre | Statistically significant but small change: real, but possibly not biologically important |
| Bottom | Not significant, whatever the fold change |

The bottom-left and bottom-right corners deserve attention. Points there have large fold changes but weak evidence, usually because the gene is lowly expressed or varies a lot between replicates. They are not discoveries.

## Raw or adjusted p-values?

An RNA-seq experiment tests around 20,000 genes. At a raw threshold of p < 0.05 you would expect about 1,000 false positives even if nothing changed at all. Differential-expression tools therefore report an **adjusted p-value** (usually Benjamini–Hochberg, also called the false discovery rate or FDR). Thresholds and colours on a volcano plot should be based on adjusted values. If a figure legend says "p < 0.05" without saying whether it is adjusted, ask.

Many people still plot the raw p-value on the y-axis because it spreads the points more evenly, and then colour points by the adjusted value. That is acceptable, but the legend must say so.

## Fold-change shrinkage

Genes with very few reads can show enormous fold changes simply because 2 reads versus 10 reads is a five-fold change. DESeq2 and edgeR offer **shrinkage** of fold-change estimates (for example \`lfcShrink\` in DESeq2 with the \`apeglm\` method), which pulls unreliable estimates towards zero. Plotting shrunken fold changes removes the misleading cloud of low-count genes with huge values and makes the plot far more honest.

## Making one in R

\`\`\`r
library(DESeq2)
library(ggplot2)

res <- lfcShrink(dds, coef = "condition_treated_vs_control", type = "apeglm")
df  <- as.data.frame(res)
df$status <- "Not significant"
df$status[df$padj < 0.05 & df$log2FoldChange >  1] <- "Up"
df$status[df$padj < 0.05 & df$log2FoldChange < -1] <- "Down"

ggplot(df, aes(log2FoldChange, -log10(pvalue), colour = status)) +
  geom_point(size = 0.8, alpha = 0.7) +
  geom_vline(xintercept = c(-1, 1), linetype = "dashed") +
  scale_colour_manual(values = c(Down = "#2f6fdf", Up = "#d6455d", \`Not significant\` = "grey70")) +
  labs(x = "log2 fold change", y = "-log10 p-value", colour = NULL) +
  theme_minimal()
\`\`\`

Genes with \`padj = NA\` (DESeq2 sets these for genes filtered out by independent filtering or flagged as outliers) are left grey, which is the correct behaviour.

## Common mistakes

1. **Choosing thresholds after looking at the plot.** Thresholds should be decided before the analysis. Moving them until "interesting" genes become significant is a form of p-hacking.
2. **Ignoring the direction of the comparison.** Whether up means "higher in treated" or "higher in control" depends on the contrast. State it in the axis label or legend.
3. **Labelling only the genes that fit the story.** If you label genes, label by a rule (for example the top 10 by adjusted p-value) and say what the rule is.
4. **Reading it without the MA plot.** A volcano plot hides expression level. An MA plot (fold change against mean expression) shows whether significant genes are concentrated at low counts, which is a warning sign.
5. **Over-interpreting a single gene.** A point in the top right is a hypothesis for validation, not a finding. Confirm key genes with an independent method such as qPCR.

## Try it yourself

The Expression Studio in our Workbench runs a differential-expression analysis on a demo dataset in your browser and draws an interactive volcano plot you can hover over, so you can see how changing thresholds changes the picture. The full workflow, from raw reads to DESeq2 and pathway enrichment, is taught in our RNA-seq Data Analysis course.
`,course:`rna-seq-data-analysis`,keywords:[`volcano plot interpretation`,`volcano plot RNA-seq`,`how to read volcano plot`]},{slug:`fastq-format-phred-quality-scores`,title:`FASTQ format and Phred quality scores explained`,seoTitle:`FASTQ Format & Phred Quality Scores Explained`,description:`The four lines of a FASTQ record, how Phred+33 quality encoding works, and how to read the FastQC panels that matter.`,category:`Tutorials`,published:`2026-10-14`,body:`Almost every sequencing project starts with FASTQ files. Before you align, assemble or quantify anything, you need to know what is inside them and how to judge whether the data are good enough. This guide explains the FASTQ format, how Phred quality scores are encoded, and how to read the parts of a FastQC report that matter most.

## The four lines of a FASTQ record

A FASTQ file stores reads one after another, and every read takes exactly four lines:

\`\`\`text
@A00123:8:H7KLMDSXX:1:1101:10004:1000 1:N:0:ATCACG
GATTTGGGGTTCAAAGCAGTATCGATCAAATAGTAAATCCATTTGTTCAACTCACAGTTT
+
IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII9IC7IIIIIII@I
\`\`\`

1. **The header** starts with \`@\` and identifies the read. On Illumina data it encodes the instrument, run, flow cell, lane, tile and cluster coordinates, followed by the read number (1 or 2 for paired-end data) and the index sequence.
2. **The sequence** of bases. \`N\` means the base could not be called.
3. **A separator** line starting with \`+\`, sometimes repeating the header.
4. **The quality string**, one character per base, giving the confidence of each base call.

Because \`@\` can also appear as a quality character, never parse FASTQ by searching for lines that start with \`@\`. Always read four lines at a time.

## Phred quality scores

Each quality character encodes a Phred score Q, defined as

\`\`\`text
Q = -10 × log10(P)
\`\`\`

where P is the estimated probability that the base call is wrong.

| Phred score | Error probability | Base-call accuracy |
|---|---|---|
| 10 | 1 in 10 | 90% |
| 20 | 1 in 100 | 99% |
| 30 | 1 in 1,000 | 99.9% |
| 40 | 1 in 10,000 | 99.99% |

Q30 is a common benchmark: sequencing providers often report the percentage of bases at Q30 or above.

## How the characters encode the score

To fit a number into one character, the score is added to an offset and stored as the ASCII character with that code. Modern Illumina data (and practically all data produced since about 2011) use the **Phred+33** encoding, also called Sanger encoding:

\`\`\`python
def phred(ch, offset=33):
    return ord(ch) - offset

[phred(c) for c in "II9C"]   # [40, 40, 24, 34]
\`\`\`

Old Illumina pipelines (version 1.3 to 1.7) used Phred+64. If you see quality strings made mostly of lower-case letters, you may have old Phred+64 data, and tools need to be told. Recent Illumina instruments also *bin* quality scores into a few values (for example 2, 12, 23 and 37 on NovaSeq), so do not be surprised by a quality string that uses only a handful of characters.

## Reading a FastQC report

FastQC summarises a FASTQ file into a series of panels. Its pass, warn and fail flags are calibrated for random whole-genome DNA libraries, so a "fail" is not automatically a problem. The panels to read carefully are:

- **Per base sequence quality.** Box plots of quality at each position along the read. A gradual decline towards the end of the read is normal for Illumina. A sudden collapse, or low quality throughout, is not.
- **Per sequence quality scores.** Should show one peak at high quality. A second peak at low quality indicates a subset of bad reads, often from one part of the flow cell.
- **Per base sequence content.** For RNA-seq, the first 10 to 12 bases almost always show uneven composition because of biased random-hexamer priming. This fails the check but is expected.
- **Sequence duplication levels.** High duplication is expected in RNA-seq (highly expressed genes produce many identical reads) and in amplicon data. In whole-genome DNA it suggests low library complexity or PCR over-amplification.
- **Overrepresented sequences and adapter content.** Adapter sequence appearing towards the end of reads means the DNA fragments were shorter than the read length. This is common and is fixed by adapter trimming.

## What to do next

If adapters are present or quality drops sharply, trim with a tool such as fastp, Trim Galore or Cutadapt, then run FastQC again to confirm. With many samples, MultiQC combines all the reports into one page so outliers stand out. Keep the trimming parameters in your methods section: reviewers ask for them.

A quick sanity check in the shell counts reads, which is the number of lines divided by four:

\`\`\`bash
echo $(( $(zcat sample_R1.fastq.gz | wc -l) / 4 ))
\`\`\`

Paired-end files must contain the same number of reads, in the same order. If they do not, something went wrong in transfer or trimming.

## Learn more

FASTQ handling, quality control and trimming are covered hands-on in our Bioinformatics Foundations and NGS Data Analysis courses. You can also check a FASTA file's structure with our free FASTA Validator, which runs in your browser.
`,course:`ngs-data-analysis`,tool:`fasta-validator`,keywords:[`FASTQ format`,`Phred quality score`,`FastQC report explained`]},{slug:`vcf-file-format-explained`,title:`The VCF file format explained, with examples`,seoTitle:`VCF File Format Explained with Examples`,description:`Every column of a VCF file, how genotypes and indels are written, QUAL versus GQ, and practical bcftools commands.`,category:`Tutorials`,published:`2026-10-14`,body:'The Variant Call Format (VCF) is how genetic variants are stored and exchanged. Variant callers write it, annotation tools read and extend it, and databases such as ClinVar and gnomAD distribute their data in it. If you work with sequencing data you will read VCF files constantly, so it pays to understand every column. This guide walks through the format with examples.\n\n## The structure of a VCF file\n\nA VCF file has three parts:\n\n1. **Meta-information lines** starting with `##`. They describe the file: format version, reference genome, and the definitions of every `INFO`, `FORMAT` and `FILTER` field used.\n2. **One header line** starting with a single `#` that names the columns.\n3. **Data lines**, one per variant site.\n\n```text\n##fileformat=VCFv4.2\n##reference=GRCh38\n##INFO=<ID=DP,Number=1,Type=Integer,Description="Total read depth">\n##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">\n##FORMAT=<ID=AD,Number=R,Type=Integer,Description="Allelic depths">\n#CHROM  POS      ID           REF  ALT  QUAL  FILTER  INFO   FORMAT  SAMPLE1      SAMPLE2\nchr7    117559590 rs113993960 ATCT A    812   PASS    DP=64  GT:AD   0/1:30,28    0/0:35,0\nchr17   7675088   .           C    T    356   PASS    DP=41  GT:AD   0/1:22,19    1/1:0,38\n```\n\nThe `##INFO` and `##FORMAT` definitions are not decoration: they tell you what each abbreviation means in this particular file. Different callers use different fields, so always check the header before interpreting a value.\n\n## The eight fixed columns\n\n| Column | Meaning |\n|---|---|\n| CHROM | Chromosome or contig name, which must match the reference used |\n| POS | 1-based position of the first base in REF |\n| ID | Variant identifier, such as a dbSNP rsID, or `.` if none |\n| REF | Reference allele |\n| ALT | Alternative allele(s), comma-separated if more than one |\n| QUAL | Phred-scaled confidence that a variant exists at this site |\n| FILTER | `PASS`, or the names of filters the variant failed |\n| INFO | Site-level annotations as `KEY=value` pairs separated by semicolons |\n\n### How insertions and deletions are written\n\nIndels include one base before the event, called the padding or anchor base. In the first example above, `REF=ATCT` and `ALT=A` describe a deletion of `TCT` after the `A` at position 117559590. An insertion of `GG` after a `C` would be written `REF=C`, `ALT=CGG`. This convention is why the same variant can appear with different positions in different tools: before comparing variant sets, **normalise** them (left-align and split multi-allelic sites) with `bcftools norm`.\n\n## Sample columns and genotypes\n\nAfter `INFO` comes a `FORMAT` column listing the per-sample fields, and then one column per sample with values in the same order.\n\nThe genotype field `GT` uses allele indices: `0` is the reference allele, `1` the first ALT allele, `2` the second, and so on.\n\n| GT | Meaning |\n|---|---|\n| `0/0` | Homozygous reference |\n| `0/1` | Heterozygous |\n| `1/1` | Homozygous alternative |\n| `1/2` | Two different ALT alleles |\n| `./.` | No call |\n| `0\\|1` | Phased heterozygous (the `\\|` means the haplotype order is known) |\n\nOther common FORMAT fields:\n\n- **AD**: allelic depths, the number of reads supporting REF and each ALT. A heterozygous call with `AD=30,28` is well supported; `AD=40,3` should make you suspicious.\n- **DP**: read depth at the site for this sample.\n- **GQ**: genotype quality, the Phred-scaled confidence in the genotype call itself.\n- **PL**: Phred-scaled likelihoods of each possible genotype; the called genotype has `PL=0`.\n\n## QUAL is not GQ\n\n`QUAL` describes the site: how confident the caller is that *any* variant exists here across all samples. `GQ` describes one sample\'s genotype. A site can have high QUAL because one sample is clearly variant while another sample at the same site has a poorly supported genotype with low GQ. Filtering only on QUAL misses this.\n\n## Working with VCF files\n\nVCFs are usually compressed with `bgzip` and indexed with `tabix`, which allows fast lookup by region. `bcftools` covers most everyday tasks:\n\n```bash\n# Variants that passed all filters in a region\nbcftools view -f PASS -r chr17:7660000-7690000 calls.vcf.gz\n\n# A simple table of position, alleles and genotypes\nbcftools query -f \'%CHROM\\t%POS\\t%REF\\t%ALT[\\t%GT]\\n\' calls.vcf.gz\n\n# Count SNVs and indels\nbcftools stats calls.vcf.gz | grep \'^SN\'\n```\n\nAnnotation tools such as Ensembl VEP and SnpEff add their results to the INFO column (VEP as a `CSQ` field), describing the predicted effect on genes and transcripts.\n\n## Common pitfalls\n\n1. **Reference mismatch.** `chr1` (UCSC style) and `1` (Ensembl style) name the same chromosome differently, and coordinates differ between GRCh37 and GRCh38. Check the `##reference` line.\n2. **Comparing un-normalised indels.** Normalise before intersecting call sets.\n3. **Assuming missing means reference.** `./.` means no data, not `0/0`. This matters a great deal when computing allele frequencies.\n4. **Treating filtered variants as absent.** A variant with a non-PASS FILTER value is still in the file unless you remove it.\n\n## Learn more\n\nVariant calling with GATK and bcftools, filtering, annotation and interpretation are covered end to end in our NGS Data Analysis course. The Variant Studio in our Workbench can open a VCF in your browser for quality control and filtering without uploading it anywhere.\n',course:`ngs-data-analysis`,keywords:[`VCF file format`,`VCF genotype`,`bcftools tutorial`]},{slug:`molecular-docking-validation`,title:`Molecular docking: how to set up and validate a docking study`,seoTitle:`Molecular Docking Validation: Redocking, RMSD & Decoys`,description:`Structure choice, preparation, search boxes, redocking RMSD, actives-versus-decoys enrichment and what docking results can and cannot claim.`,category:`Drug discovery`,published:`2026-10-14`,body:`Molecular docking predicts how a small molecule might bind to a protein and estimates how strongly. It is fast, free and visually convincing, which is why it appears in so many papers and theses. It is also easy to do badly. A docking score on its own is not evidence that a compound binds. This guide explains how a docking study should be set up and, above all, how to validate it so the results mean something.

## What docking does

A docking program does two things:

1. **Search.** It explores positions, orientations and conformations (poses) of the ligand inside a defined region of the protein.
2. **Score.** It ranks those poses with a scoring function that approximates binding free energy. AutoDock Vina, for example, reports scores in kcal/mol, where more negative means a predicted stronger interaction.

Scoring functions are fast approximations. They largely ignore or simplify solvation, entropy, protein flexibility and protonation changes. That is why docking is good at producing plausible poses and at enriching actives in a large library, but poor at predicting exact affinities or ranking similar compounds precisely.

## Step 1: choose and inspect the structure

The structure you dock into matters more than any parameter.

- Prefer an experimental structure with a bound ligand in the site of interest, at good resolution (around 2.5 Å or better).
- Check for missing residues or loops near the binding site, and alternate conformations.
- If you use a predicted model (for example from AlphaFold DB), check the per-residue confidence (pLDDT) around the pocket. Low-confidence regions are a serious risk, and predicted structures are generally modelled without ligands, so side chains may not be in a binding-competent arrangement.

## Step 2: prepare the protein and ligands

- Remove crystallisation additives and, usually, water molecules (keep a water only if it is known to mediate binding).
- Add hydrogens and assign protonation states appropriate to physiological pH. Histidine is the classic problem.
- Prepare ligands in 3D with correct protonation and tautomers. A ligand drawn in the wrong charge state can dock completely differently.
- Convert files to the format your docking program expects (PDBQT for Vina), for example with Open Babel or Meeko.

Record every choice: they belong in your methods section.

## Step 3: define the search space

Docking searches a box. If a co-crystallised ligand is present, centre the box on it with a margin of several ångströms on every side. A box that is too small cuts off valid poses; one that is far too large makes the search less reliable. "Blind docking" over the whole protein is sometimes used to look for sites, but it is much less reliable than docking into a known pocket.

## Step 4: validate the protocol

This is the step most often skipped, and the one reviewers increasingly ask for.

### Redocking

Take the ligand from the crystal structure, prepare it as you would any other ligand, dock it back into its own protein and compare the top pose with the experimental pose. The usual measure is the heavy-atom **RMSD**:

| RMSD | Interpretation |
|---|---|
| ≤ 2.0 Å | Pose reproduced: the protocol can find the correct binding mode |
| > 2.0 Å | Pose not reproduced: revisit preparation, box or protonation |

Redocking is a minimum check. It is optimistic, because the protein is already shaped around that ligand. **Cross-docking**, docking a ligand into a structure solved with a different ligand, is a tougher and more realistic test.

### Actives versus decoys

If you are screening a library, check whether your protocol can tell known actives from inactive molecules. Collect known actives for the target (for example from ChEMBL) and property-matched decoys (the DUD-E database provides decoys for many targets), dock them all, and measure how well the scores separate them with a ROC curve or enrichment factor. If known actives do not rank above decoys, the screening results are not informative.

## Step 5: analyse poses, not only scores

- Look at the top poses. Do they make the interactions known to matter for this target, such as hydrogen bonds to catalytic residues?
- Profile protein–ligand interactions with a tool such as PLIP, and present them clearly.
- Cluster poses: a consistent binding mode across the top poses is more convincing than a single best score.
- Apply drug-likeness and ADMET filters before prioritising compounds for testing.

## What not to claim

- Do not present docking scores as binding affinities or compare them as if they were measured values. Differences of 1 kcal/mol between Vina scores are within the method's error.
- Do not conclude that a compound "inhibits" a target from docking alone. Docking generates hypotheses for experimental testing.
- Do not report results without the validation: a protocol that cannot redock its own ligand cannot be trusted with new ones.

## A short checklist

1. Structure choice justified, quality checked.
2. Preparation steps and software versions recorded.
3. Box defined from a known ligand or pocket, with coordinates reported.
4. Redocking RMSD reported; cross-docking if possible.
5. Actives-versus-decoys enrichment for any virtual screen.
6. Interaction analysis for every highlighted compound.
7. Claims limited to prioritisation, with experimental validation as the next step.

## Learn and practise

The full structure-based workflow, from target selection to a validated virtual screen, is taught in our Molecular Docking & Structure-Based Drug Discovery course. Our Structure Studio lets you load a PDB entry in your browser and profile protein–ligand interactions immediately.
`,course:`molecular-docking-drug-discovery`,keywords:[`molecular docking validation`,`redocking RMSD`,`AutoDock Vina tutorial`]},{slug:`qsar-model-validation`,title:`QSAR model validation: avoiding the common traps`,seoTitle:`QSAR Model Validation: Splits, Y-Randomisation & AD`,description:`OECD principles, data curation, scaffold and cluster splits, baselines, Y-randomisation, metrics and applicability domains for trustworthy QSAR models.`,category:`Drug discovery`,published:`2026-10-14`,body:`A QSAR (quantitative structure–activity relationship) model learns how a molecule's structure relates to its activity or property, so that new molecules can be predicted before they are made or bought. Building a model that scores well is easy. Building one whose score means something is harder, because molecular datasets have properties that make standard machine-learning validation over-optimistic. This guide covers the validation practices that separate a trustworthy QSAR model from a misleading one.

## The OECD principles

The OECD principles for the validation of QSAR models, widely used in regulatory and academic work, ask that a model has:

1. A defined endpoint.
2. An unambiguous algorithm.
3. A defined domain of applicability.
4. Appropriate measures of goodness-of-fit, robustness and predictivity.
5. A mechanistic interpretation, if possible.

Points 3 and 4 are where most published models fall short.

## Start with clean data

Model quality is limited by data quality. Before modelling:

- **Standardise structures.** Remove salts, neutralise charges where appropriate and pick a consistent tautomer, so the same compound is not represented two ways.
- **Merge duplicates.** The same compound often appears several times with different measurements. Average replicate values or drop compounds whose measurements disagree strongly.
- **Do not mix endpoints.** IC50, Ki and percentage inhibition are different measurements; IC50 values from different assays are not always comparable either. Use one activity type, ideally from consistent assay conditions.
- **Use a log scale.** Model pIC50 (−log10 of IC50 in mol/L) rather than raw IC50.

## Why random splits are too optimistic

Chemical datasets are made of series: groups of close analogues made around the same scaffold. With a random train/test split, most test compounds have a near-identical sibling in the training set, and the model only has to interpolate. Performance looks excellent and then collapses on genuinely new chemistry.

Better alternatives:

| Split | How it works | What it measures |
|---|---|---|
| Random | Compounds assigned at random | Interpolation within known series (optimistic) |
| Scaffold | Compounds grouped by Bemis–Murcko scaffold | Prediction for new scaffolds |
| Cluster | Compounds clustered by fingerprint similarity (for example Butina) and whole clusters held out | Prediction for dissimilar chemistry |
| Temporal | Train on older compounds, test on newer | How the model would have performed in practice |

Report which split you used. If you can, report more than one: the gap between random and cluster performance tells the reader how much the model depends on close analogues.

## Compare against a baseline

A model is only useful if it beats something simple. Useful baselines are predicting the mean activity for every compound, and a nearest-neighbour model that predicts each compound's activity as that of its most similar training compound. If a complex model barely beats nearest-neighbour similarity, it has learned little beyond similarity.

## Y-randomisation

Y-randomisation (also called Y-scrambling) checks for chance correlation. Shuffle the activity values, so that structure and activity are no longer related, retrain the model with exactly the same procedure, and repeat several times. A sound model's performance should collapse to around zero on scrambled data. If scrambled models still score well, the modelling procedure is finding patterns that are not there, often through leakage or an overly flexible model on a small dataset.

## Metrics

For regression models, report R² or Q² on held-out data together with an error measure in activity units, such as RMSE or MAE in pIC50 units. An RMSE of 0.7 log units means typical errors of about five-fold in IC50, which is useful to know when deciding what the model can be used for.

For classification models, be careful with accuracy on imbalanced data: if 90% of compounds are inactive, predicting "inactive" every time scores 90%. Report ROC AUC, balanced accuracy or the Matthews correlation coefficient, and the class balance.

## Applicability domain

A model can only be trusted for molecules similar to those it learned from. The applicability domain defines that region. A simple and widely used approach is similarity to the training set: compute each new molecule's maximum Tanimoto similarity to any training compound (using Morgan fingerprints, for example) and flag predictions below a threshold as outside the domain. Report predictions together with this flag, and show that error is indeed lower inside the domain than outside it.

## Write a model card

Summarise the model in a short document: the endpoint and data source, curation steps, descriptors or fingerprints, algorithm and hyperparameters, validation scheme and results, applicability-domain definition, and known limitations. It makes the model reusable and makes its limits explicit for the next person.

## Checklist

1. Data curated: standardised, deduplicated, one endpoint, log scale.
2. Scaffold or cluster validation reported alongside random.
3. Baseline comparison.
4. Y-randomisation performed.
5. Appropriate metrics with errors in activity units.
6. Applicability domain defined and used.
7. Model card written.

## Learn and practise

Our Cheminformatics & QSAR Modelling course builds a model from a ChEMBL dataset through every step above. The QSAR Lab in our Chemistry Studio runs random forest, kNN and ridge models with cluster cross-validation, Y-randomisation and an applicability domain directly in your browser.
`,course:`cheminformatics-qsar-modelling`,keywords:[`QSAR model validation`,`applicability domain QSAR`,`Y-randomization`]},{slug:`gc-content-python`,title:`Calculate GC content in Python: a step-by-step tutorial`,seoTitle:`Calculate GC Content in Python (FASTA + Sliding Window)`,description:`Build a GC content calculator in Python: handle ambiguous bases, parse FASTA, compute a sliding window, plot it and test your code.`,category:`Programming`,published:`2026-10-14`,body:`Calculating GC content is often the first program a bioinformatics student writes. It is short, but doing it properly touches several ideas that matter in real analysis: reading FASTA files, handling ambiguous bases, choosing window sizes and checking your code against known answers. This tutorial builds a GC content calculator in Python step by step.

## What we are calculating

GC content is the fraction of bases in a sequence that are guanine (G) or cytosine (C):

\`\`\`text
GC% = (G + C) / (A + T + G + C) × 100
\`\`\`

Note the denominator: it counts only the four unambiguous bases. If a sequence contains N (unknown base), including it in the denominator would make GC content look lower than it is.

## Version 1: a single sequence

\`\`\`python
def gc_content(seq: str) -> float:
    seq = seq.upper()
    gc = seq.count("G") + seq.count("C")
    at = seq.count("A") + seq.count("T") + seq.count("U")
    if gc + at == 0:
        raise ValueError("no A, C, G, T or U in the sequence")
    return 100 * gc / (gc + at)

print(gc_content("ATGCGCNNAT"))   # 50.0
\`\`\`

Upper-casing first means soft-masked (lower-case) sequence is handled. Counting U as well makes the function work for RNA.

## Version 2: reading a FASTA file

Real sequences come in FASTA files, often with several records. The header line must not be counted, which is a surprisingly common bug when people concatenate all lines.

\`\`\`python
def read_fasta(path):
    name, parts = None, []
    with open(path) as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            if line.startswith(">"):
                if name is not None:
                    yield name, "".join(parts)
                name, parts = line[1:].split()[0], []
            else:
                parts.append(line)
    if name is not None:
        yield name, "".join(parts)

for name, seq in read_fasta("genes.fasta"):
    print(f"{name}\\t{len(seq)}\\t{gc_content(seq):.2f}")
\`\`\`

Using a generator (\`yield\`) means the function never holds the whole file in memory, so it works on large files too.

With Biopython the same thing is shorter, and \`gc_fraction\` handles ambiguity codes for you:

\`\`\`python
from Bio import SeqIO
from Bio.SeqUtils import gc_fraction

for record in SeqIO.parse("genes.fasta", "fasta"):
    print(record.id, round(100 * gc_fraction(record.seq), 2))
\`\`\`

Writing it yourself first is still worthwhile: you understand exactly what the library does, and you can check it.

## Version 3: a sliding window

A single number hides local variation. A sliding window computes GC content along the sequence, which reveals features such as CpG islands or GC-rich promoters.

\`\`\`python
def gc_windows(seq: str, window: int = 100, step: int = 25):
    seq = seq.upper()
    for start in range(0, len(seq) - window + 1, step):
        chunk = seq[start:start + window]
        gc = chunk.count("G") + chunk.count("C")
        at = chunk.count("A") + chunk.count("T")
        if gc + at:
            yield start + window // 2, 100 * gc / (gc + at)
\`\`\`

Each value is reported at the centre of its window. Plot it with matplotlib:

\`\`\`python
import matplotlib.pyplot as plt

name, seq = next(read_fasta("genes.fasta"))
x, y = zip(*gc_windows(seq, window=100, step=10))
plt.plot(x, y)
plt.axhline(gc_content(seq), linestyle="--", color="grey")
plt.xlabel("Position (bp)")
plt.ylabel("GC content (%)")
plt.title(name)
plt.show()
\`\`\`

Window size is a trade-off. Small windows show fine detail but are noisy; large windows are smooth but blur small features. Try a few sizes and compare.

## Test your code

Scientific code should be checked against cases where the answer is known. A few assertions catch most mistakes:

\`\`\`python
assert gc_content("GGCC") == 100
assert gc_content("AATT") == 0
assert gc_content("ATGC") == 50
assert gc_content("GCNN") == 100      # N excluded from the denominator
assert gc_content("gcat") == 50       # lower case handled
\`\`\`

Put these in a file called \`test_gc.py\` and run \`pytest\` to check them automatically whenever you change the code.

## Going further

- Count CpG dinucleotides and compare observed with expected CpG, the usual definition of CpG islands.
- Compute GC content at the third codon position (GC3) for coding sequences, which relates to codon-usage bias.
- Report GC skew, (G − C) / (G + C), which in bacterial genomes changes sign near the origin and terminus of replication.

## Check your results

Our free GC Content Calculator computes overall and sliding-window GC content in your browser. Use it to check the output of your own script. Python for biology is taught from first principles in our Python for Bioinformatics course, where this calculator grows into a tested command-line toolkit.
`,course:`python-for-bioinformatics`,tool:`gc-content-calculator`,keywords:[`GC content python`,`python bioinformatics beginner`,`biopython gc_fraction`]},{slug:`how-to-become-a-bioinformatician`,title:`How to become a bioinformatician: a roadmap for biology students`,seoTitle:`How to Become a Bioinformatician: A Practical Roadmap`,description:`What bioinformaticians do, what to learn first, how to build a portfolio and how to get experience, for biology and biotechnology students.`,category:`Careers`,published:`2026-10-14`,body:`Bioinformatics sits between biology, computing and statistics, and people reach it from all three directions. That flexibility is an advantage, but it also makes the path confusing: there are many tools, languages and opinions, and it is not obvious what to learn first. This roadmap is written for students with a biology, biotechnology, microbiology or pharmacy background, and is useful for computer-science students moving the other way.

## What bioinformaticians actually do

Job titles vary (bioinformatician, computational biologist, bioinformatics analyst, research software engineer, data scientist in life sciences), but the day-to-day work usually combines several of these:

- Processing and analysing sequencing data: genomes, exomes, transcriptomes, single-cell and microbiome data.
- Building and maintaining reproducible pipelines that other scientists run.
- Statistical analysis and visualisation for papers and grant reports.
- Structural bioinformatics and computational chemistry in drug-discovery teams.
- Developing new methods or software, which is more common in research groups and tool-building companies.

Most roles involve more data handling and communication than students expect, and less novel algorithm design.

## Stage 1: foundations (first three months)

**Biology, from a data point of view.** Revisit the central dogma, gene structure and genetic variation, but ask what each experiment actually measures. What does a read count represent? What does a variant call mean?

**The command line.** Almost every bioinformatics tool runs in Linux. Learn to move around the file system, use \`grep\`, \`cut\`, \`sort\`, \`awk\` and pipes, and install software with conda.

**One programming language.** Pick Python or R and stay with it until you are comfortable. Python is more general-purpose and widely used in pipelines and machine learning. R is strongest for statistics and hosts Bioconductor. You will likely use both eventually, but learning two at once slows you down.

**Core formats and databases.** FASTA, FASTQ, SAM/BAM, VCF and GFF; NCBI, Ensembl, UniProt and PDB.

## Stage 2: statistics and one application area (months 3 to 6)

**Statistics.** Distributions, hypothesis testing, regression, and especially multiple-testing correction and the false discovery rate. Genomic datasets test thousands of hypotheses at once, and misunderstanding this is the most common source of wrong conclusions.

**One application in depth.** Choose the area closest to your interests and complete it end to end:

- Bulk RNA-seq: QC, quantification, DESeq2, enrichment.
- Variant calling: alignment, GATK or bcftools, annotation.
- Structure-based drug discovery: protein preparation, docking, validation.
- Microbiome: QIIME 2, diversity and differential abundance.

Depth matters more than breadth here. One analysis you can explain and defend is worth more than ten tutorials you followed without understanding.

## Stage 3: reproducibility and portfolio (months 6 to 12)

**Version control.** Learn Git and put your work on GitHub. Employers look at it.

**Workflows and environments.** Learn the basics of a workflow manager (Nextflow or Snakemake) and of containers (Docker or Apptainer). Try running an nf-core pipeline.

**Build a portfolio.** Two or three well-documented projects carry more weight than a list of certificates. Good projects:

- Re-analyse a published dataset from GEO or SRA and compare your results with the paper's.
- Write a small, tested tool that solves a real problem and document it properly.
- Contribute a fix or documentation improvement to an open-source bioinformatics project.

For each project, write a short README explaining the question, the data, the methods, the results and the limitations.

## Getting experience

**Internships and project work.** A mentored project with code review teaches habits that are hard to learn alone, and gives you someone who can describe your work in a reference.

**Research groups.** Many academic labs have more data than analysts. Offering to help with a well-defined analysis, under supervision, is a common route into a first role or a postgraduate position.

**Communities.** Biostars and the Bioconductor support site answer most technical questions; read the existing answers before asking. Following nf-core and other open-source projects is a good way to learn how professional pipelines are built.

## Common mistakes

1. **Collecting tools instead of understanding.** Knowing that DESeq2 exists is not the same as knowing when its assumptions fail.
2. **Skipping statistics.** It is the part interviewers probe most.
3. **No public work.** If nobody can see what you have done, it is hard for anyone to judge it.
4. **Waiting to feel ready.** Start a real project early; it shows you what you still need to learn.

## A structured path

Our learning paths follow this roadmap. The Genomics Data Scientist path runs from Bioinformatics Foundations through Python, NGS analysis, RNA-seq and single-cell analysis. The Computational Drug Discovery path covers docking, QSAR and machine learning. Both end in projects you can put in a portfolio. Our internships add mentored work on real problems.
`,keywords:[`how to become a bioinformatician`,`bioinformatics career`,`bioinformatics roadmap`]}],t=[`Tutorials`,`Workflows`,`Wet lab`,`Drug discovery`,`Programming`,`Careers`],n=t=>e.find(e=>e.slug===t);export{t as n,n as r,e as t};