Bioinformatics sits between biology, computing and statistics, and people reach it from all three directions. That flexibility is an advantage, but it also makes the path confusing: there are many tools, languages and opinions, and it is not obvious what to learn first. This roadmap is written for students with a biology, biotechnology, microbiology or pharmacy background, and is useful for computer-science students moving the other way.

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

**The command line.** Almost every bioinformatics tool runs in Linux. Learn to move around the file system, use `grep`, `cut`, `sort`, `awk` and pipes, and install software with conda.

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
