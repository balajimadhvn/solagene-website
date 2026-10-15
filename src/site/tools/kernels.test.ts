import { describe, expect, it } from 'vitest';
import { codonUsage, gcContent, parseInput, sixFrames, transform, validateFasta, wrapFasta } from './kernels';

describe('parseInput', () => {
  it('never mixes FASTA header text into the sequence', () => {
    const p = parseInput('>header with a and c\nATGAAA\nTAG', 'dna');
    expect(p.records).toEqual([{ id: 'header', seq: 'ATGAAATAG' }]);
    expect(p.invalidCount).toBe(0);
  });
  it('reports invalid characters instead of dropping them silently', () => {
    const p = parseInput('ATGXXZ', 'dna');
    expect(p.records[0].seq).toBe('ATG');
    expect(p.invalidCount).toBe(3);
    expect(p.invalid[0]).toMatchObject({ pos: 4, ch: 'X' });
  });
  it('ignores whitespace and GenBank-style numbering', () => {
    expect(parseInput('1 atgc atgc\n11 gg', 'dna').records[0].seq).toBe('ATGCATGCGG');
  });
  it('reads multi-FASTA', () => {
    expect(parseInput('>a\nAC\n>b\nGT', 'dna').records.map((r) => r.id)).toEqual(['a', 'b']);
  });
});

describe('sequence maths', () => {
  it('computes GC fraction over A/C/G/T only', () => {
    expect(gcContent('GGCCAATT').frac).toBe(0.5);
    expect(gcContent('GCNN').frac).toBe(1);
  });
  it('reverse-complements with IUPAC codes', () => {
    expect(transform('ATGCRY', 'revcomp')).toBe('RYGCAT');
    expect(transform('ATGC', 'complement')).toBe('TACG');
    expect(transform('AUGC', 'revcomp', true)).toBe('GCAU');
  });
  it('translates six frames', () => {
    const f = sixFrames('ATGGCCTAA');
    expect(f[0]).toEqual({ frame: '+1', protein: 'MA*' });
    expect(f[3].frame).toBe('-1');
    expect(f[3].protein).toBe('LGH'); // revcomp TTAGGCCAT
  });
  it('counts codons and RSCU', () => {
    const u = codonUsage('ATGCTGCTGCTTTAA');
    expect(u.total).toBe(5);
    const ctg = u.rows.find((r) => r.codon === 'CTG')!;
    expect(ctg.count).toBe(2);
    expect(ctg.fraction).toBeCloseTo(2 / 3);
    expect(ctg.rscu).toBeCloseTo((2 * 6) / 3); // leucine has six codons
  });
});

describe('validateFasta', () => {
  it('accepts a clean file', () => {
    const v = validateFasta('>a desc\nACGT\nAC\n>b\nGG', 'dna');
    expect(v.issues).toEqual([]);
    expect(v.records).toEqual([{ id: 'a', length: 6 }, { id: 'b', length: 2 }]);
  });
  it('flags missing header, duplicates, empty records and bad characters', () => {
    const v = validateFasta('ACGT\n>a\n>a\nAC!G', 'dna');
    const msgs = v.issues.map((i) => i.msg).join(' | ');
    expect(msgs).toMatch(/first line must be a header/);
    expect(msgs).toMatch(/Duplicate identifier "a"/);
    expect(msgs).toMatch(/has no sequence/);
    expect(msgs).toMatch(/Invalid character "!"/);
  });
  it('wraps to a fixed width', () => {
    expect(wrapFasta([{ id: 'x', seq: 'ACGTACGT' }], 3)).toBe('>x\nACG\nTAC\nGT');
  });
});
