Almost every sequencing project starts with FASTQ files. Before you align, assemble or quantify anything, you need to know what is inside them and how to judge whether the data are good enough. This guide explains the FASTQ format, how Phred quality scores are encoded, and how to read the parts of a FastQC report that matter most.

## The four lines of a FASTQ record

A FASTQ file stores reads one after another, and every read takes exactly four lines:

```text
@A00123:8:H7KLMDSXX:1:1101:10004:1000 1:N:0:ATCACG
GATTTGGGGTTCAAAGCAGTATCGATCAAATAGTAAATCCATTTGTTCAACTCACAGTTT
+
IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII9IC7IIIIIII@I
```

1. **The header** starts with `@` and identifies the read. On Illumina data it encodes the instrument, run, flow cell, lane, tile and cluster coordinates, followed by the read number (1 or 2 for paired-end data) and the index sequence.
2. **The sequence** of bases. `N` means the base could not be called.
3. **A separator** line starting with `+`, sometimes repeating the header.
4. **The quality string**, one character per base, giving the confidence of each base call.

Because `@` can also appear as a quality character, never parse FASTQ by searching for lines that start with `@`. Always read four lines at a time.

## Phred quality scores

Each quality character encodes a Phred score Q, defined as

```text
Q = -10 × log10(P)
```

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

```python
def phred(ch, offset=33):
    return ord(ch) - offset

[phred(c) for c in "II9C"]   # [40, 40, 24, 34]
```

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

```bash
echo $(( $(zcat sample_R1.fastq.gz | wc -l) / 4 ))
```

Paired-end files must contain the same number of reads, in the same order. If they do not, something went wrong in transfer or trimming.

## Learn more

FASTQ handling, quality control and trimming are covered hands-on in our Bioinformatics Foundations and NGS Data Analysis courses. You can also check a FASTA file's structure with our free FASTA Validator, which runs in your browser.
