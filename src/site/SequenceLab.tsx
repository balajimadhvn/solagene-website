import { useMemo, useState } from 'react';
import { Link } from './Link';
import { I } from './icons';
import { gcWindows, parseInput, transform } from './tools/kernels';

// Standard genetic code, codon index = 16*i1 + 4*i2 + i3 with base order T, C, A, G.
const CODE = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
const BASE: Record<string, number> = { T: 0, C: 1, A: 2, G: 3 };
const MAX_NT = 900;

export const EXAMPLE = '>demo synthetic ORF\nGGATCCATGGCTGACAAAGAGCTGGTTCTGGGTCGTATCAAAGAAGCGATTCTGGAAGGTTCTCCGGGTCTGTAAGAATTC';

const cls = (aa: string) => (aa === '*' ? 'stop' : 'KRH'.includes(aa) ? 'pos' : 'DE'.includes(aa) ? 'neg' : 'AVLIMFWCPG'.includes(aa) ? 'hyd' : 'pol');
function translate(s: string) {
  const out: { codon: string; aa: string }[] = [];
  for (let i = 0; i + 3 <= s.length; i += 3) { const c = s.slice(i, i + 3); const k = [...c].map((x) => BASE[x]); out.push({ codon: c, aa: k.some((x) => x === undefined) ? 'X' : CODE[16 * k[0] + 4 * k[1] + k[2]] }); }
  return out;
}
/** Longest Met-to-stop stretch in a translated frame, as codon indices. */
function longestOrf(p: { aa: string }[]) {
  let best: [number, number] | null = null, start = -1;
  p.forEach((x, i) => {
    if (start < 0 && x.aa === 'M') start = i;
    if (start >= 0 && x.aa === '*') { if (!best || i - start > best[1] - best[0]) best = [start, i]; start = -1; }
  });
  return best as [number, number] | null;
}

export default function SequenceLab() {
  const [raw, setRaw] = useState(EXAMPLE);
  const [frame, setFrame] = useState(0);
  const [strand, setStrand] = useState<'+' | '-'>('+');

  const d = useMemo(() => {
    const p = parseInput(raw.replace(/U/gi, 'T'), 'dna');
    const all = p.records.map((r) => r.seq).join('');
    const clean = all.slice(0, MAX_NT);
    const gcN = [...clean].filter((c) => c === 'G' || c === 'C').length, atN = [...clean].filter((c) => c === 'A' || c === 'T').length;
    const strandSeq = strand === '+' ? clean : transform(clean, 'revcomp');
    const prot = translate(strandSeq.slice(frame));
    return { p, clean, truncated: all.length > MAX_NT, gc: gcN + atN ? gcN / (gcN + atN) : 0, prot, orf: longestOrf(prot), prof: gcWindows(clean, 12, 1).map((x) => x.gc) };
  }, [raw, frame, strand]);

  const W = 560, H = 64;
  const path = d.prof.length > 1 ? d.prof.map((v, i) => `${i ? 'L' : 'M'}${((i / (d.prof.length - 1)) * W).toFixed(1)},${(H - 4 - v * (H - 8)).toFixed(1)}`).join(' ') : '';
  const area = path ? `${path} L${W},${H} L0,${H} Z` : '';
  const orfNt = d.orf ? (d.orf[1] - d.orf[0]) * 3 + 3 : 0;

  return (
    <div className="lab">
      <div className="lab-col">
        <div className="lab-head">
          <label htmlFor="lab-in" className="label">Input · DNA or FASTA</label>
          <div className="inline" style={{ gap: 6 }}>
            <button type="button" className="button button--secondary button--sm" onClick={() => { setRaw(EXAMPLE); setFrame(0); setStrand('+'); }}>Example</button>
            <button type="button" className="button button--ghost button--sm" onClick={() => setRaw('')} disabled={!raw}>Clear</button>
          </div>
        </div>
        <textarea id="lab-in" className="lab-ta" spellCheck={false} aria-label="DNA sequence" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Paste DNA (A, C, G, T) or a FASTA record" />
        {d.p.invalidCount > 0 && <div className="notice notice--caution" role="status"><I.Alert width={16} height={16} /><span>Ignored {d.p.invalidCount} character{d.p.invalidCount > 1 ? 's' : ''} that {d.p.invalidCount > 1 ? 'are' : 'is'} not DNA ({[...new Set(d.p.invalid.map((x) => x.ch))].slice(0, 5).map((c) => `“${c}”`).join(', ')}).</span></div>}
        <div className="lab-stats lab-meta"><span><b>{d.clean.length}</b> nt{d.truncated && ` (first ${MAX_NT})`}{d.p.hadHeader && ' · FASTA header read'}</span><span>GC <b>{(d.gc * 100).toFixed(1)}%</b></span></div>
        <div>
          <p className="label" style={{ marginBottom: 6 }}>GC fraction, 12-nt window</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="lab-spark" preserveAspectRatio="none" role="img" aria-label="GC content profile along the sequence">
            <line x1="0" x2={W} y1={H / 2} y2={H / 2} className="md" />
            {area && <path d={area} className="ar" />}
            {path && <path d={path} className="ln" />}
          </svg>
        </div>
      </div>

      <div className="lab-col">
        <div className="lab-head">
          <span className="label">Translation</span>
          <div className="inline" style={{ gap: 6 }}>
            <div className="seg" role="group" aria-label="Reading frame">{[0, 1, 2].map((f) => <button type="button" key={f} aria-pressed={frame === f} onClick={() => setFrame(f)} aria-label={`Frame ${f + 1}`}>{f + 1}</button>)}</div>
            <div className="seg" role="group" aria-label="Strand">{(['+', '-'] as const).map((s) => <button type="button" key={s} aria-pressed={strand === s} onClick={() => setStrand(s)}>{s === '+' ? 'Forward' : 'Reverse'}</button>)}</div>
          </div>
        </div>
        <div className="codons" tabIndex={0} role="region" aria-live="polite" aria-label={`Translation, frame ${frame + 1}, ${strand === '+' ? 'forward' : 'reverse'} strand`}>
          {d.prot.length === 0 && <span className="subtle small">Enter at least three bases to see a translation.</span>}
          {d.prot.slice(0, 150).map((p, i) => (
            <span key={`${strand}${frame}${i}`} title={`${p.codon} → ${p.aa}`} className={`cod ${cls(p.aa)} ${d.orf && i >= d.orf[0] && i <= d.orf[1] ? 'in-orf' : ''}`} style={{ animationDelay: `${Math.min(i * 0.008, 0.4)}s` }}>
              <small>{p.codon}</small><b>{p.aa}</b>
            </span>
          ))}
        </div>
        <p className="small muted">{d.orf ? <><b className="lab-orf">Longest ORF: {d.orf[1] - d.orf[0]} aa</b> ({orfNt} nt), codons {d.orf[0] + 1}–{d.orf[1] + 1}, outlined in blue.</> : 'No complete Met-to-stop ORF in this frame. Try another frame or the reverse strand.'}</p>
        <div className="lab-legend" aria-hidden><span><i style={{ background: 'var(--viz-5)' }} />Hydrophobic</span><span><i style={{ background: 'var(--ink-2)' }} />Polar</span><span><i style={{ background: 'var(--viz-1)' }} />Basic</span><span><i style={{ background: 'var(--signal)' }} />Acidic</span><span><i style={{ background: 'var(--ink)' }} />Stop</span></div>
      </div>

      <div className="lab-foot">
        <span>A small part of Sequence Studio, which adds primer design, cloning, CRISPR guide design and alignment.</span>
        <div className="inline" style={{ gap: 8 }}>
          <Link to="/nayancode/tools/orf-finder" className="button button--secondary button--sm">ORF finder</Link>
          <Link to="/sequence" className="button button--primary button--sm">Open Sequence Studio <I.Arrow width={15} height={15} /></Link>
        </div>
      </div>
    </div>
  );
}
