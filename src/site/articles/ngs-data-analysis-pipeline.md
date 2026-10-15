Next-generation sequencing (NGS) produces millions of short reads. Turning them into reliable variant calls follows a well-established pipeline: quality control, alignment, post-processing, variant calling and filtering. This guide explains each step for short-read whole-genome or exome data, names the standard tools and highlights where analyses usually go wrong.

## The pipeline at a glance

```text
FASTQ → QC & trimming → alignment (BAM) → sort, mark duplicates
      → base-quality recalibration (optional) → variant calling (VCF)
      → filtering → annotation → interpretation
```

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

```bash
bwa mem -t 8 -R '@RG\tID:S1\tSM:S1\tPL:ILLUMINA' GRCh38.fa S1_R1.fq.gz S1_R2.fq.gz \
  | samtools sort -o S1.sorted.bam
samtools index S1.sorted.bam
```

The read-group line (`-R`) records the sample name and sequencing run; variant callers rely on it.

## 3. Post-processing

- **Mark duplicates** with Picard or GATK MarkDuplicates, so that PCR and optical duplicates do not inflate support for a variant.
- **Base-quality score recalibration (BQSR)** in GATK corrects systematic errors in base qualities using known variant sites. It is part of GATK best practice for germline calling.
- **Check alignment metrics:** mapping rate, insert-size distribution and coverage. For exomes, measure coverage over the target regions; for genomes, look at mean depth and evenness.

```bash
samtools flagstat S1.sorted.bam
mosdepth -n --by targets.bed S1 S1.sorted.bam
```

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
