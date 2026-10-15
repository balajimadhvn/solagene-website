A volcano plot is the figure most people look at first after a differential-expression analysis. It shows thousands of genes at once and lets you see, in a single glance, which changed a lot and which changed reliably. It is also one of the most frequently misread figures in biology papers. This guide explains what each part of the plot means, how to read it correctly and the mistakes reviewers tend to catch.

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

Genes with very few reads can show enormous fold changes simply because 2 reads versus 10 reads is a five-fold change. DESeq2 and edgeR offer **shrinkage** of fold-change estimates (for example `lfcShrink` in DESeq2 with the `apeglm` method), which pulls unreliable estimates towards zero. Plotting shrunken fold changes removes the misleading cloud of low-count genes with huge values and makes the plot far more honest.

## Making one in R

```r
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
  scale_colour_manual(values = c(Down = "#2f6fdf", Up = "#d6455d", `Not significant` = "grey70")) +
  labs(x = "log2 fold change", y = "-log10 p-value", colour = NULL) +
  theme_minimal()
```

Genes with `padj = NA` (DESeq2 sets these for genes filtered out by independent filtering or flagged as outliers) are left grey, which is the correct behaviour.

## Common mistakes

1. **Choosing thresholds after looking at the plot.** Thresholds should be decided before the analysis. Moving them until "interesting" genes become significant is a form of p-hacking.
2. **Ignoring the direction of the comparison.** Whether up means "higher in treated" or "higher in control" depends on the contrast. State it in the axis label or legend.
3. **Labelling only the genes that fit the story.** If you label genes, label by a rule (for example the top 10 by adjusted p-value) and say what the rule is.
4. **Reading it without the MA plot.** A volcano plot hides expression level. An MA plot (fold change against mean expression) shows whether significant genes are concentrated at low counts, which is a warning sign.
5. **Over-interpreting a single gene.** A point in the top right is a hypothesis for validation, not a finding. Confirm key genes with an independent method such as qPCR.

## Try it yourself

The Expression Studio in our Workbench runs a differential-expression analysis on a demo dataset in your browser and draws an interactive volcano plot you can hover over, so you can see how changing thresholds changes the picture. The full workflow, from raw reads to DESeq2 and pathway enrichment, is taught in our RNA-seq Data Analysis course.
