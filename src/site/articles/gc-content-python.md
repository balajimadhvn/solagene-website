Calculating GC content is often the first program a bioinformatics student writes. It is short, but doing it properly touches several ideas that matter in real analysis: reading FASTA files, handling ambiguous bases, choosing window sizes and checking your code against known answers. This tutorial builds a GC content calculator in Python step by step.

## What we are calculating

GC content is the fraction of bases in a sequence that are guanine (G) or cytosine (C):

```text
GC% = (G + C) / (A + T + G + C) × 100
```

Note the denominator: it counts only the four unambiguous bases. If a sequence contains N (unknown base), including it in the denominator would make GC content look lower than it is.

## Version 1: a single sequence

```python
def gc_content(seq: str) -> float:
    seq = seq.upper()
    gc = seq.count("G") + seq.count("C")
    at = seq.count("A") + seq.count("T") + seq.count("U")
    if gc + at == 0:
        raise ValueError("no A, C, G, T or U in the sequence")
    return 100 * gc / (gc + at)

print(gc_content("ATGCGCNNAT"))   # 50.0
```

Upper-casing first means soft-masked (lower-case) sequence is handled. Counting U as well makes the function work for RNA.

## Version 2: reading a FASTA file

Real sequences come in FASTA files, often with several records. The header line must not be counted, which is a surprisingly common bug when people concatenate all lines.

```python
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
    print(f"{name}\t{len(seq)}\t{gc_content(seq):.2f}")
```

Using a generator (`yield`) means the function never holds the whole file in memory, so it works on large files too.

With Biopython the same thing is shorter, and `gc_fraction` handles ambiguity codes for you:

```python
from Bio import SeqIO
from Bio.SeqUtils import gc_fraction

for record in SeqIO.parse("genes.fasta", "fasta"):
    print(record.id, round(100 * gc_fraction(record.seq), 2))
```

Writing it yourself first is still worthwhile: you understand exactly what the library does, and you can check it.

## Version 3: a sliding window

A single number hides local variation. A sliding window computes GC content along the sequence, which reveals features such as CpG islands or GC-rich promoters.

```python
def gc_windows(seq: str, window: int = 100, step: int = 25):
    seq = seq.upper()
    for start in range(0, len(seq) - window + 1, step):
        chunk = seq[start:start + window]
        gc = chunk.count("G") + chunk.count("C")
        at = chunk.count("A") + chunk.count("T")
        if gc + at:
            yield start + window // 2, 100 * gc / (gc + at)
```

Each value is reported at the centre of its window. Plot it with matplotlib:

```python
import matplotlib.pyplot as plt

name, seq = next(read_fasta("genes.fasta"))
x, y = zip(*gc_windows(seq, window=100, step=10))
plt.plot(x, y)
plt.axhline(gc_content(seq), linestyle="--", color="grey")
plt.xlabel("Position (bp)")
plt.ylabel("GC content (%)")
plt.title(name)
plt.show()
```

Window size is a trade-off. Small windows show fine detail but are noisy; large windows are smooth but blur small features. Try a few sizes and compare.

## Test your code

Scientific code should be checked against cases where the answer is known. A few assertions catch most mistakes:

```python
assert gc_content("GGCC") == 100
assert gc_content("AATT") == 0
assert gc_content("ATGC") == 50
assert gc_content("GCNN") == 100      # N excluded from the denominator
assert gc_content("gcat") == 50       # lower case handled
```

Put these in a file called `test_gc.py` and run `pytest` to check them automatically whenever you change the code.

## Going further

- Count CpG dinucleotides and compare observed with expected CpG, the usual definition of CpG islands.
- Compute GC content at the third codon position (GC3) for coding sequences, which relates to codon-usage bias.
- Report GC skew, (G − C) / (G + C), which in bacterial genomes changes sign near the origin and terminus of replication.

## Check your results

Our free GC Content Calculator computes overall and sliding-window GC content in your browser. Use it to check the output of your own script. Python for biology is taught from first principles in our Python for Bioinformatics course, where this calculator grows into a tested command-line toolkit.
