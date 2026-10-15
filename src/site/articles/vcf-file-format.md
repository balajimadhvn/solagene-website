The Variant Call Format (VCF) is how genetic variants are stored and exchanged. Variant callers write it, annotation tools read and extend it, and databases such as ClinVar and gnomAD distribute their data in it. If you work with sequencing data you will read VCF files constantly, so it pays to understand every column. This guide walks through the format with examples.

## The structure of a VCF file

A VCF file has three parts:

1. **Meta-information lines** starting with `##`. They describe the file: format version, reference genome, and the definitions of every `INFO`, `FORMAT` and `FILTER` field used.
2. **One header line** starting with a single `#` that names the columns.
3. **Data lines**, one per variant site.

```text
##fileformat=VCFv4.2
##reference=GRCh38
##INFO=<ID=DP,Number=1,Type=Integer,Description="Total read depth">
##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">
##FORMAT=<ID=AD,Number=R,Type=Integer,Description="Allelic depths">
#CHROM  POS      ID           REF  ALT  QUAL  FILTER  INFO   FORMAT  SAMPLE1      SAMPLE2
chr7    117559590 rs113993960 ATCT A    812   PASS    DP=64  GT:AD   0/1:30,28    0/0:35,0
chr17   7675088   .           C    T    356   PASS    DP=41  GT:AD   0/1:22,19    1/1:0,38
```

The `##INFO` and `##FORMAT` definitions are not decoration: they tell you what each abbreviation means in this particular file. Different callers use different fields, so always check the header before interpreting a value.

## The eight fixed columns

| Column | Meaning |
|---|---|
| CHROM | Chromosome or contig name, which must match the reference used |
| POS | 1-based position of the first base in REF |
| ID | Variant identifier, such as a dbSNP rsID, or `.` if none |
| REF | Reference allele |
| ALT | Alternative allele(s), comma-separated if more than one |
| QUAL | Phred-scaled confidence that a variant exists at this site |
| FILTER | `PASS`, or the names of filters the variant failed |
| INFO | Site-level annotations as `KEY=value` pairs separated by semicolons |

### How insertions and deletions are written

Indels include one base before the event, called the padding or anchor base. In the first example above, `REF=ATCT` and `ALT=A` describe a deletion of `TCT` after the `A` at position 117559590. An insertion of `GG` after a `C` would be written `REF=C`, `ALT=CGG`. This convention is why the same variant can appear with different positions in different tools: before comparing variant sets, **normalise** them (left-align and split multi-allelic sites) with `bcftools norm`.

## Sample columns and genotypes

After `INFO` comes a `FORMAT` column listing the per-sample fields, and then one column per sample with values in the same order.

The genotype field `GT` uses allele indices: `0` is the reference allele, `1` the first ALT allele, `2` the second, and so on.

| GT | Meaning |
|---|---|
| `0/0` | Homozygous reference |
| `0/1` | Heterozygous |
| `1/1` | Homozygous alternative |
| `1/2` | Two different ALT alleles |
| `./.` | No call |
| `0\|1` | Phased heterozygous (the `\|` means the haplotype order is known) |

Other common FORMAT fields:

- **AD**: allelic depths, the number of reads supporting REF and each ALT. A heterozygous call with `AD=30,28` is well supported; `AD=40,3` should make you suspicious.
- **DP**: read depth at the site for this sample.
- **GQ**: genotype quality, the Phred-scaled confidence in the genotype call itself.
- **PL**: Phred-scaled likelihoods of each possible genotype; the called genotype has `PL=0`.

## QUAL is not GQ

`QUAL` describes the site: how confident the caller is that *any* variant exists here across all samples. `GQ` describes one sample's genotype. A site can have high QUAL because one sample is clearly variant while another sample at the same site has a poorly supported genotype with low GQ. Filtering only on QUAL misses this.

## Working with VCF files

VCFs are usually compressed with `bgzip` and indexed with `tabix`, which allows fast lookup by region. `bcftools` covers most everyday tasks:

```bash
# Variants that passed all filters in a region
bcftools view -f PASS -r chr17:7660000-7690000 calls.vcf.gz

# A simple table of position, alleles and genotypes
bcftools query -f '%CHROM\t%POS\t%REF\t%ALT[\t%GT]\n' calls.vcf.gz

# Count SNVs and indels
bcftools stats calls.vcf.gz | grep '^SN'
```

Annotation tools such as Ensembl VEP and SnpEff add their results to the INFO column (VEP as a `CSQ` field), describing the predicted effect on genes and transcripts.

## Common pitfalls

1. **Reference mismatch.** `chr1` (UCSC style) and `1` (Ensembl style) name the same chromosome differently, and coordinates differ between GRCh37 and GRCh38. Check the `##reference` line.
2. **Comparing un-normalised indels.** Normalise before intersecting call sets.
3. **Assuming missing means reference.** `./.` means no data, not `0/0`. This matters a great deal when computing allele frequencies.
4. **Treating filtered variants as absent.** A variant with a non-PASS FILTER value is still in the file unless you remove it.

## Learn more

Variant calling with GATK and bcftools, filtering, annotation and interpretation are covered end to end in our NGS Data Analysis course. The Variant Studio in our Workbench can open a VCF in your browser for quality control and filtering without uploading it anywhere.
