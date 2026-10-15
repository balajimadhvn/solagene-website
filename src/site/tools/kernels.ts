/** Pure helpers for the free web tools. Sequence maths is shared with Sequence Studio (studios/sequence/kernels). */
import { parseFasta, translate } from '@/studios/sequence/kernels';

export type Alphabet = 'dna' | 'rna' | 'protein';
const ALLOWED: Record<Alphabet, RegExp> = {
  dna: /[ACGTRYKMSWBDHVN]/, // IUPAC nucleotide codes
  rna: /[ACGURYKMSWBDHVN]/,
  protein: /[ACDEFGHIKLMNPQRSTVWYBZXUO*]/,
};

export interface Parsed {
  records: { id: string; seq: string }[];
  /** Sequence characters that are not valid for the alphabet, with 1-based positions (first 20). */
  invalid: { record: string; pos: number; ch: string }[];
  invalidCount: number;
  hadHeader: boolean;
}

/**
 * Accepts raw sequence or multi-FASTA. Headers are never mixed into the sequence; whitespace and digits
 * (as in GenBank-style numbered blocks) are ignored; anything else that is not a valid letter is reported
 * rather than silently dropped.
 */
export function parseInput(text: string, alphabet: Alphabet): Parsed {
  const hadHeader = /^\s*>/m.test(text);
  const recs = hadHeader ? parseFastaRaw(text) : [{ id: 'sequence', raw: text }];
  const out: Parsed = { records: [], invalid: [], invalidCount: 0, hadHeader };
  for (const r of recs) {
    let seq = '';
    for (const ch0 of r.raw) {
      if (/[\s\d]/.test(ch0)) continue;
      const ch = ch0.toUpperCase();
      if (ALLOWED[alphabet].test(ch) && ch.length === 1) seq += ch;
      else { out.invalidCount++; if (out.invalid.length < 20) out.invalid.push({ record: r.id, pos: seq.length + 1, ch: ch0 }); }
    }
    if (seq) out.records.push({ id: r.id, seq });
  }
  return out;
}

function parseFastaRaw(text: string) {
  const out: { id: string; raw: string }[] = [];
  let cur: { id: string; raw: string } | null = null;
  for (const line of text.split(/\r?\n/)) {
    if (line.trimStart().startsWith('>')) { cur = { id: line.trim().slice(1).split(/\s+/)[0] || `seq${out.length + 1}`, raw: '' }; out.push(cur); }
    else if (line.trimStart().startsWith(';')) continue;
    else { if (!cur) { cur = { id: 'sequence', raw: '' }; out.push(cur); } cur.raw += line; }
  }
  return out;
}

export const gcContent = (s: string) => {
  let gc = 0, at = 0;
  for (const c of s) { if (c === 'G' || c === 'C' || c === 'S') gc++; else if (c === 'A' || c === 'T' || c === 'U' || c === 'W') at++; }
  return { gc, at, other: s.length - gc - at, frac: gc + at ? gc / (gc + at) : 0 };
};

export function gcWindows(s: string, win: number, step = Math.max(1, Math.floor(win / 4))) {
  const pts: { pos: number; gc: number }[] = [];
  for (let i = 0; i + win <= s.length; i += step) pts.push({ pos: i + win / 2, gc: gcContent(s.slice(i, i + win)).frac });
  return pts;
}

const COMP: Record<string, string> = { A: 'T', T: 'A', U: 'A', G: 'C', C: 'G', R: 'Y', Y: 'R', K: 'M', M: 'K', S: 'S', W: 'W', B: 'V', V: 'B', D: 'H', H: 'D', N: 'N' };
export function transform(s: string, mode: 'revcomp' | 'reverse' | 'complement', rna = false) {
  const comp = (c: string) => { const x = COMP[c] ?? 'N'; return rna && x === 'T' ? 'U' : x; };
  if (mode === 'reverse') return [...s].reverse().join('');
  if (mode === 'complement') return [...s].map(comp).join('');
  return [...s].reverse().map(comp).join('');
}

/** Six reading frames. Frames on the reverse strand are numbered -1..-3 as in common tools. */
export function sixFrames(dna: string) {
  const d = dna.replace(/U/g, 'T');
  const rc = transform(d, 'revcomp');
  return [0, 1, 2].map((f) => ({ frame: `+${f + 1}`, protein: translate(d, f) })).concat([0, 1, 2].map((f) => ({ frame: `-${f + 1}`, protein: translate(rc, f) })));
}

/** Codon usage of an in-frame coding sequence: counts, per-thousand frequency and relative synonymous codon usage. */
const CODE = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
const B = 'TCAG';
export const CODONS = Array.from({ length: 64 }, (_, i) => ({ codon: B[i >> 4] + B[(i >> 2) & 3] + B[i & 3], aa: CODE[i] }));
export function codonUsage(dna: string) {
  const d = dna.replace(/U/g, 'T');
  const counts: Record<string, number> = Object.fromEntries(CODONS.map((c) => [c.codon, 0]));
  let total = 0, skipped = 0;
  for (let i = 0; i + 3 <= d.length; i += 3) { const c = d.slice(i, i + 3); if (c in counts) { counts[c]++; total++; } else skipped++; }
  const byAa: Record<string, number> = {};
  const synonyms: Record<string, number> = {};
  for (const c of CODONS) { byAa[c.aa] = (byAa[c.aa] ?? 0) + counts[c.codon]; synonyms[c.aa] = (synonyms[c.aa] ?? 0) + 1; }
  const rows = CODONS.map((c) => ({
    ...c, count: counts[c.codon],
    perThousand: total ? (1000 * counts[c.codon]) / total : 0,
    fraction: byAa[c.aa] ? counts[c.codon] / byAa[c.aa] : 0,
    rscu: byAa[c.aa] ? (counts[c.codon] * synonyms[c.aa]) / byAa[c.aa] : 0,
  }));
  return { rows, total, skipped, remainder: d.length % 3 };
}

export interface FastaIssue { level: 'error' | 'warning'; line?: number; msg: string }
/** Structural FASTA validation: headers, empty records, duplicate IDs, invalid characters, mixed line widths. */
export function validateFasta(text: string, alphabet: Alphabet) {
  const issues: FastaIssue[] = [];
  const lines = text.split(/\r?\n/);
  if (!text.trim()) return { issues: [{ level: 'error' as const, msg: 'The input is empty.' }], records: [] as { id: string; length: number }[] };
  const firstContent = lines.findIndex((l) => l.trim() !== '');
  if (!lines[firstContent].startsWith('>')) issues.push({ level: 'error', line: firstContent + 1, msg: 'The first line must be a header starting with ">".' });
  const seen = new Map<string, number>();
  const records: { id: string; length: number }[] = [];
  let cur: { id: string; length: number; widths: number[]; line: number } | null = null;
  const close = () => {
    if (!cur) return;
    if (cur.length === 0) issues.push({ level: 'error', line: cur.line, msg: `Record "${cur.id}" has no sequence.` });
    const body = cur.widths.slice(0, -1);
    if (body.length > 1 && new Set(body).size > 1) issues.push({ level: 'warning', line: cur.line, msg: `Record "${cur.id}" uses inconsistent line widths; some tools (e.g. samtools faidx) require a fixed width.` });
    records.push({ id: cur.id, length: cur.length });
  };
  lines.forEach((raw, i) => {
    const line = raw.replace(/\s+$/, '');
    if (line.startsWith('>')) {
      close();
      const id = line.slice(1).trim().split(/\s+/)[0];
      if (!id) issues.push({ level: 'error', line: i + 1, msg: 'Header has no identifier after ">".' });
      if (/^\s/.test(line.slice(1))) issues.push({ level: 'warning', line: i + 1, msg: 'Space directly after ">"; many tools will read an empty identifier.' });
      if (id && seen.has(id)) issues.push({ level: 'error', line: i + 1, msg: `Duplicate identifier "${id}" (first seen on line ${seen.get(id)}).` });
      if (id) seen.set(id, i + 1);
      cur = { id: id || `(line ${i + 1})`, length: 0, widths: [], line: i + 1 };
    } else if (line.trim() === '') {
      return;
    } else {
      if (!cur) return;
      const bad = [...line].filter((c) => !ALLOWED[alphabet].test(c.toUpperCase()));
      if (bad.length) issues.push({ level: 'error', line: i + 1, msg: `Invalid character${bad.length > 1 ? 's' : ''} ${[...new Set(bad)].slice(0, 6).map((c) => `"${c}"`).join(', ')} for ${alphabet.toUpperCase()}.` });
      if (/[a-z]/.test(line)) issues.push({ level: 'warning', line: i + 1, msg: 'Lower-case letters (often soft-masked repeats). Fine for most tools; note it if masking matters.' });
      cur.length += line.length - bad.length;
      cur.widths.push(line.length);
    }
  });
  close();
  // Collapse repeated warnings about lower case into one.
  const lc = issues.filter((x) => x.msg.startsWith('Lower-case'));
  const rest = issues.filter((x) => !x.msg.startsWith('Lower-case'));
  if (lc.length) rest.push({ level: 'warning', line: lc[0].line, msg: `Lower-case letters on ${lc.length} line${lc.length > 1 ? 's' : ''} (often soft-masked repeats).` });
  return { issues: rest, records };
}

export const wrapFasta = (records: { id: string; seq: string }[], width = 60) =>
  records.map((r) => `>${r.id}\n${r.seq.match(new RegExp(`.{1,${width}}`, 'g'))?.join('\n') ?? ''}`).join('\n');

export { parseFasta };
