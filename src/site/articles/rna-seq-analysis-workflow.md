RNA-seq measures which genes are expressed in a sample and how strongly. A typical project compares two or more conditions (treated and untreated cells, tumour and normal tissue, wild type and knockout) and asks which genes change. This article walks through the standard bulk RNA-seq workflow from raw reads to biological interpretation, explains what each step does and points out where analyses most often go wrong.

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

Both routes give a **count matrix**: genes as rows, samples as columns. If you use Salmon or kallisto, import the transcript estimates into R with `tximport` so that gene-level counts account for transcript length.

The nf-core/rnaseq pipeline runs these steps reproducibly and produces both a count matrix and a MultiQC report, which is a sensible default for many projects.

## 4. Explore the data before testing

Before any statistical test, check whether samples behave as expected.

- Apply a variance-stabilising transformation (`vst` or `rlog` in DESeq2). Raw counts are dominated by a few highly expressed genes.
- Plot a **PCA** of the samples. Replicates of the same condition should cluster together. If samples group by extraction date, sequencing lane or sex instead of condition, you have found a batch effect or a hidden variable.
- Look at sample-to-sample distance heatmaps and library sizes. A single outlier can distort the whole analysis.

## 5. Differential expression

DESeq2 and edgeR model counts with a negative binomial distribution, which handles the extra variability of biological replicates better than a t-test on normalised values. They also normalise for library size internally, so you give them raw counts, not TPM or FPKM.

```r
library(DESeq2)
dds <- DESeqDataSetFromMatrix(counts, colData = samples, design = ~ batch + condition)
dds <- DESeq(dds)
res <- results(dds, contrast = c("condition", "treated", "control"), alpha = 0.05)
summary(res)
```

Including `batch` in the design formula accounts for a known batch effect during testing. The output gives, for every gene, a log2 fold change, a p-value and an **adjusted p-value** controlling the false discovery rate. Use the adjusted value to decide significance, and consider fold-change shrinkage (`lfcShrink`) before ranking or plotting genes.

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
