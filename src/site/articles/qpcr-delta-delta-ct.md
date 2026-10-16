Quantitative PCR (qPCR) is the workhorse method for measuring gene expression, and the comparative Ct method, usually called **ΔΔCt** (delta-delta Ct), is the most common way to turn raw Ct values into fold changes. This guide explains what Ct values mean, walks through a complete ΔΔCt calculation with numbers, and lists the checks that make the result trustworthy.

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

```text
ΔCt  = Ct(target) − Ct(reference)
ΔΔCt = ΔCt(treated) − ΔCt(control)
Fold change = 2^(−ΔΔCt)
```

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

```python
import numpy as np
from scipy import stats

dct_control = np.array([8.2, 8.5, 7.9])   # one value per biological replicate
dct_treated = np.array([5.9, 6.3, 5.6])

t, p = stats.ttest_ind(dct_treated, dct_control)
ddct = dct_treated.mean() - dct_control.mean()
print(f"fold change = {2 ** -ddct:.2f}, p = {p:.4f}")
```

## When ΔΔCt is not appropriate

The 2^(−ΔΔCt) formula assumes amplification efficiencies close to 100% for both genes. Check this with a **standard curve**: run a dilution series of cDNA, plot Ct against log10 of the input, and calculate efficiency from the slope.

```text
Efficiency (%) = (10^(−1/slope) − 1) × 100
```

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

To run these calculations on your own plate, [Nayancode Lab Studio](/nayancode/products/lab-studio) computes ΔΔCt (Livak) and efficiency-corrected Pfaffl ratios with several reference genes, flags outlying technical replicates and tests ΔCt between groups, in your browser. It reproduces the Livak and Schmittgen worked example exactly.
