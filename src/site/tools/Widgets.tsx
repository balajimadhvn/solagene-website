import { useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import { align, digest, ENZYMES, findOrfs, oligoTm, proteinProps } from '@/studios/sequence/kernels';
import { I } from '../icons';
import { useCopy } from '../primitives';
import { codonUsage, gcContent, gcWindows, parseInput, sixFrames, transform, validateFasta, wrapFasta, type Parsed } from './kernels';

const DNA_EX = '>pUC19_lacZ_fragment\nATGACCATGATTACGCCAAGCTTGCATGCCTGCAGGTCGACTCTAGAGGATCCCCGGGTACCGAGCTCGAATTCACTGGCCGTCGTTTTACAACGTCGTGACTGGGAAAACCCTGGCGTTACCCAACTTAATCGCCTTGCAGCACATCCCCCTTTCGCCAGCTGGCGTAATAGCGAAGAGGCCCGCACCGATCGCCCTTCCCAACAGTTGCGCAGCCTGAATGGCGAATGGCGC';
/** ORF example: the same lacZ fragment with a TAA stop codon appended, so the default 30-codon search finds a complete ORF. */
const ORF_EX = '>pUC19_lacZ_fragment (TAA stop added for this example)\nATGACCATGATTACGCCAAGCTTGCATGCCTGCAGGTCGACTCTAGAGGATCCCCGGGTACCGAGCTCGAATTCACTGGCCGTCGTTTTACAACGTCGTGACTGGGAAAACCCTGGCGTTACCCAACTTAATCGCCTTGCAGCACATCCCCCTTTCGCCAGCTGGCGTAATAGCGAAGAGGCCCGCACCGATCGCCCTTCCCAACAGTTGCGCAGCCTGAATGGCGAATGGCGCTAA';
const PROT_EX = '>sp|P69905|HBA_HUMAN Hemoglobin subunit alpha\nMVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR';
const PROT_EX2 = '>sp|P68871|HBB_HUMAN Hemoglobin subunit beta\nMVHLTPEEKSAVTALWGKVNVDEVGGEALGRLLVVYPWTQRFFESFGDLSTPDAVMGNPKVKAHGKKVLGAFSDGLAHLDNLKGTFATLSELHCDKLHVDPENFRLLGNVLVCVLAHHFGKEFTPPVQAAYQKVVAGVANALAHKYH';
const FASTA_EX = '>seq1 example record\nATGCGTACGTTAGC\nATGCGTAC\n>seq2\nGGCCAATT\n>seq1\nACGTXN';

function CopyBtn({ text }: { text: string }) {
  const [ok, copy] = useCopy();
  return <button type="button" className="copy" onClick={() => copy(text)} aria-label="Copy result">{ok ? <><I.Check width={13} height={13} />Copied</> : <><I.Copy width={13} height={13} />Copy</>}</button>;
}
function Download({ text, name }: { text: string; name: string }) {
  return <button type="button" className="button button--secondary button--sm" onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }}><I.Download width={15} height={15} />Download {name.split('.').pop()?.toUpperCase()}</button>;
}

function Input({ value, set, example, label, placeholder, id = 'tool-in', short }: { value: string; set: (v: string) => void; example: string; label: string; placeholder: string; id?: string; short?: boolean }) {
  return (
    <div className="stack-xs">
      <div className="tool-row"><label htmlFor={id}>{label}</label><div className="inline" style={{ gap: 6 }}><button type="button" className="button button--secondary button--sm" onClick={() => set(example)}>Example</button><button type="button" className="button button--ghost button--sm" onClick={() => set('')} disabled={!value}>Clear</button></div></div>
      <textarea id={id} className={`seq-ta ${short ? 'seq-ta--short' : ''}`} spellCheck={false} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
function Invalid({ p, kind }: { p: Parsed; kind: string }) {
  if (!p.invalidCount) return null;
  const chars = [...new Set(p.invalid.map((x) => x.ch))].slice(0, 6).map((c) => `“${c}”`).join(', ');
  return <div className="notice notice--caution" role="status"><I.Alert width={17} height={17} /><span>{p.invalidCount} character{p.invalidCount > 1 ? 's were' : ' was'} not valid {kind} and {p.invalidCount > 1 ? 'were' : 'was'} ignored: {chars}{p.invalid[0] && <> (first at position {p.invalid[0].pos}{p.records.length > 1 || p.hadHeader ? ` of ${p.invalid[0].record}` : ''})</>}.</span></div>;
}
const Empty = ({ children }: { children: ReactNode }) => <div className="empty" style={{ padding: 28 }}>{children}</div>;
const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
const toDna = (s: string) => s.replace(/u/gi, (m) => (m === 'u' ? 't' : 'T'));

function Spark({ pts, mean }: { pts: { pos: number; gc: number }[]; mean: number }) {
  if (pts.length < 2) return null;
  const W = 600, H = 110, max = pts[pts.length - 1].pos, min = pts[0].pos;
  const x = (p: number) => ((p - min) / (max - min || 1)) * W, y = (g: number) => H - 6 - g * (H - 12);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.pos).toFixed(1)},${y(p.gc).toFixed(1)}`).join('');
  return <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Sliding-window GC content; mean ${(mean * 100).toFixed(1)}%`}><line className="md" x1="0" x2={W} y1={y(mean)} y2={y(mean)} /><path className="ar" d={`${d}L${W},${H}L0,${H}Z`} /><path className="ln" d={d} /></svg>;
}

/* ---------------- GC content ---------------- */
function GcTool() {
  const [raw, setRaw] = useState(DNA_EX);
  const [win, setWin] = useState(50);
  const text = useDeferredValue(raw);
  const p = useMemo(() => parseInput(toDna(text), 'dna'), [text]);
  const rows = p.records.map((r) => ({ id: r.id, len: r.seq.length, ...gcContent(r.seq) }));
  const first = p.records[0];
  return (
    <div className="tool-body">
      <div><Input value={raw} set={setRaw} example={DNA_EX} label="DNA or RNA sequence (raw or FASTA)" placeholder="Paste a sequence or one or more FASTA records" /></div>
      <div>
        <Invalid p={p} kind="DNA/RNA" />
        {!first ? <Empty>Paste a sequence to see its GC content.</Empty> : <>
          <div className="metrics">
            <div className="metric"><small>GC content</small><b>{fmt(rows[0].frac * 100)}<em>%</em></b></div>
            <div className="metric"><small>Length</small><b>{rows[0].len.toLocaleString()}<em>nt</em></b></div>
            <div className="metric"><small>G + C</small><b>{rows[0].gc.toLocaleString()}</b></div>
            <div className="metric"><small>A + T/U</small><b>{rows[0].at.toLocaleString()}</b></div>
          </div>
          {rows[0].other > 0 && <p className="small subtle">{rows[0].other} ambiguous base{rows[0].other > 1 ? 's' : ''} (for example N) excluded from the percentage.</p>}
          <div className="stack-xs">
            <div className="tool-row"><label htmlFor="gc-win">Sliding window: {win} nt{p.records.length > 1 ? ` · ${first.id}` : ''}</label><input id="gc-win" className="range" type="range" min={10} max={Math.max(20, Math.min(500, Math.floor(first.seq.length / 2)))} value={win} onChange={(e) => setWin(+e.target.value)} /></div>
            {first.seq.length >= win * 2 ? <Spark pts={gcWindows(first.seq, win, Math.max(1, Math.floor(win / 5)))} mean={rows[0].frac} /> : <p className="small subtle">The sequence is too short for a {win}-nt window profile.</p>}
          </div>
          {rows.length > 1 && <div className="dtable-wrap" tabIndex={0} role="region" aria-label="Results table"><table className="dtable"><thead><tr><th scope="col">Record</th><th scope="col">Length</th><th scope="col">GC %</th></tr></thead><tbody>{rows.map((r, i) => <tr key={r.id + i}><td>{r.id}</td><td>{r.len.toLocaleString()}</td><td>{fmt(r.frac * 100)}</td></tr>)}</tbody></table></div>}
        </>}
      </div>
    </div>
  );
}

/* ---------------- Reverse complement ---------------- */
function RevCompTool() {
  const [raw, setRaw] = useState(DNA_EX);
  const [mode, setMode] = useState<'revcomp' | 'reverse' | 'complement'>('revcomp');
  const [rna, setRna] = useState(false);
  const text = useDeferredValue(raw);
  const p = useMemo(() => parseInput(text, rna ? 'rna' : 'dna'), [text, rna]);
  const out = p.records.map((r) => ({ id: r.id, seq: transform(r.seq, mode, rna) }));
  const result = p.hadHeader || out.length > 1 ? wrapFasta(out.map((r) => ({ id: `${r.id}_${mode}`, seq: r.seq })), 60) : out[0]?.seq ?? '';
  return (
    <div className="tool-body">
      <div><Input value={raw} set={setRaw} example={DNA_EX} label="DNA or RNA sequence (raw or FASTA)" placeholder="Paste a sequence" /></div>
      <div>
        <div className="inline">
          <div className="seg" role="group" aria-label="Operation">{([['revcomp', 'Reverse complement'], ['complement', 'Complement'], ['reverse', 'Reverse']] as const).map(([k, l]) => <button type="button" key={k} aria-pressed={mode === k} onClick={() => setMode(k)}>{l}</button>)}</div>
          <div className="seg" role="group" aria-label="Alphabet">{([['DNA', false], ['RNA', true]] as const).map(([l, v]) => <button type="button" key={l} aria-pressed={rna === v} onClick={() => setRna(v)}>{l}</button>)}</div>
        </div>
        <Invalid p={p} kind={rna ? 'RNA' : 'DNA'} />
        {result ? <><div className="out"><CopyBtn text={result} />{result}</div><div className="inline"><Download text={result} name={`${mode}.fasta`} /><span className="small subtle">{out.reduce((n, r) => n + r.seq.length, 0).toLocaleString()} nt</span></div></> : <Empty>Paste a sequence to see the result.</Empty>}
      </div>
    </div>
  );
}

/* ---------------- Translation ---------------- */
function TranslateTool() {
  const [raw, setRaw] = useState(DNA_EX);
  const text = useDeferredValue(raw);
  const p = useMemo(() => parseInput(toDna(text), 'dna'), [text]);
  const seq = p.records[0]?.seq ?? '';
  const frames = useMemo(() => sixFrames(seq), [seq]);
  const best = frames.reduce((b, f, i) => { const longest = Math.max(0, ...f.protein.split('*').map((x) => x.length)); return longest > b.l ? { i, l: longest } : b; }, { i: 0, l: -1 });
  const [sel, setSel] = useState<number | null>(null);
  const cur = frames[sel ?? best.i] ?? frames[0];
  return (
    <div className="tool-body">
      <div><Input value={raw} set={(v) => { setRaw(v); setSel(null); }} example={DNA_EX} label="DNA or mRNA sequence" placeholder="Paste a sequence" />{p.records.length > 1 && <p className="small subtle">Translating the first record ({p.records[0].id}).</p>}</div>
      <div>
        <Invalid p={p} kind="DNA" />
        {!seq ? <Empty>Paste a sequence to translate it.</Empty> : <>
          <div className="seg" role="group" aria-label="Reading frame">{frames.map((f, i) => <button type="button" key={f.frame} aria-pressed={cur === f} onClick={() => setSel(i)}>{f.frame}{i === best.i ? ' ★' : ''}</button>)}</div>
          <p className="small subtle">★ marks the frame with the longest stretch without a stop codon ({best.l} aa). M = start (blue), * = stop (dark).</p>
          <div className="aa-grid" tabIndex={0} role="region" aria-label={`Translation, frame ${cur.frame}`}>{[...cur.protein].slice(0, 600).map((a, i) => <span key={i} className={a === '*' ? 'stop' : a === 'M' ? 'met' : ''}>{a}</span>)}</div>
          <div className="out"><CopyBtn text={cur.protein} />{cur.protein || '(too short)'}</div>
        </>}
      </div>
    </div>
  );
}

/* ---------------- ORF finder ---------------- */
function OrfTool() {
  const [raw, setRaw] = useState(ORF_EX);
  const [min, setMin] = useState(30);
  const text = useDeferredValue(raw);
  const p = useMemo(() => parseInput(toDna(text), 'dna'), [text]);
  const seq = p.records[0]?.seq ?? '';
  const orfs = useMemo(() => findOrfs(seq, min), [seq, min]);
  const [open, setOpen] = useState(0);
  const o = orfs[open] ?? orfs[0];
  return (
    <div className="tool-body">
      <div className="stack-md"><Input value={raw} set={(v) => { setRaw(v); setOpen(0); }} example={ORF_EX} label="DNA sequence" placeholder="Paste a sequence" />
        <div className="tool-row"><label htmlFor="orf-min">Minimum ORF length: {min} codons</label><input id="orf-min" className="range" type="range" min={10} max={300} step={5} value={min} onChange={(e) => { setMin(+e.target.value); setOpen(0); }} /></div></div>
      <div>
        <Invalid p={p} kind="DNA" />
        {!seq ? <Empty>Paste a sequence to find ORFs.</Empty> : !orfs.length ? <Empty>No ORF of at least {min} codons. Try a lower minimum length.</Empty> : <>
          <p className="small muted"><b style={{ color: 'var(--ink)' }}>{orfs.length}</b> ORF{orfs.length > 1 ? 's' : ''} found in six frames, longest first. Select a row to see its protein.</p>
          <div className="dtable-wrap" tabIndex={0} role="region" aria-label="Results table"><table className="dtable"><thead><tr><th scope="col">#</th><th scope="col">Strand</th><th scope="col">Frame</th><th scope="col">Start–end</th><th scope="col">Length</th></tr></thead>
            <tbody>{orfs.slice(0, 100).map((r, i) => <tr key={i} className={`clickable ${o === r ? 'is-sel' : ''}`} tabIndex={0} aria-selected={o === r} onClick={() => setOpen(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(i); } }}><td>{i + 1}</td><td>{r.strand > 0 ? '+' : '−'}</td><td>{r.frame}</td><td>{r.start}–{r.end}</td><td>{r.lengthAa} aa</td></tr>)}</tbody></table></div>
          {o && <div className="out"><CopyBtn text={o.protein} /><span className="h">&gt;ORF{orfs.indexOf(o) + 1} {o.strand > 0 ? '+' : '-'}{o.frame} {o.start}-{o.end}</span>{'\n'}{o.protein}</div>}
        </>}
      </div>
    </div>
  );
}

/* ---------------- Protein MW / pI ---------------- */
function ProteinTool({ focus }: { focus: 'mw' | 'pi' }) {
  const [raw, setRaw] = useState(PROT_EX);
  const text = useDeferredValue(raw);
  const p = useMemo(() => parseInput(text, 'protein'), [text]);
  const seq = (p.records[0]?.seq ?? '').replace(/\*/g, '');
  const pp = useMemo(() => (seq ? proteinProps(seq) : null), [seq]);
  const comp = useMemo(() => { const c: Record<string, number> = {}; for (const a of seq) c[a] = (c[a] ?? 0) + 1; return Object.entries(c).sort((a, b) => b[1] - a[1]); }, [seq]);
  const curve = useMemo(() => {
    if (!seq) return [];
    const pKa = { n: 9.69, c: 2.34, K: 10.5, R: 12.4, H: 6.0, D: 3.86, E: 4.25, C: 8.3, Y: 10.07 };
    const n = (ch: string) => [...seq].filter((x) => x === ch).length;
    const k = { K: n('K'), R: n('R'), H: n('H'), D: n('D'), E: n('E'), C: n('C'), Y: n('Y') };
    const pos = (ph: number, pk: number) => 1 / (1 + 10 ** (ph - pk)), neg = (ph: number, pk: number) => 1 / (1 + 10 ** (pk - ph));
    return Array.from({ length: 141 }, (_, i) => { const ph = i / 10; return { ph, q: pos(ph, pKa.n) + k.K * pos(ph, pKa.K) + k.R * pos(ph, pKa.R) + k.H * pos(ph, pKa.H) - neg(ph, pKa.c) - k.D * neg(ph, pKa.D) - k.E * neg(ph, pKa.E) - k.C * neg(ph, pKa.C) - k.Y * neg(ph, pKa.Y) }; });
  }, [seq]);
  const odd = /[BZXUO]/.test(seq);
  return (
    <div className="tool-body">
      <div><Input value={raw} set={setRaw} example={PROT_EX} label="Protein sequence (one-letter code, raw or FASTA)" placeholder="Paste an amino-acid sequence" /></div>
      <div>
        <Invalid p={p} kind="amino-acid" />
        {odd && <div className="notice notice--caution"><I.Alert width={17} height={17} /><span>The sequence contains B, Z, X, U or O. These residues are not included in the mass and charge calculations.</span></div>}
        {!pp ? <Empty>Paste a protein sequence.</Empty> : <>
          <div className="metrics">
            {focus === 'mw' ? <><div className="metric"><small>Molecular weight</small><b>{fmt(pp.mw / 1000)}<em>kDa</em></b></div><div className="metric"><small>Average mass</small><b>{fmt(pp.mw, 1)}<em>Da</em></b></div></>
              : <><div className="metric"><small>Theoretical pI</small><b>{fmt(pp.pI)}</b></div><div className="metric"><small>Net charge at pH 7</small><b>{fmt(curve[70]?.q ?? 0, 1)}</b></div></>}
            <div className="metric"><small>Length</small><b>{pp.length}<em>aa</em></b></div>
            {focus === 'mw' ? <div className="metric"><small>pI (estimate)</small><b>{fmt(pp.pI)}</b></div> : <div className="metric"><small>Molecular weight</small><b>{fmt(pp.mw / 1000)}<em>kDa</em></b></div>}
          </div>
          {focus === 'pi' && curve.length > 0 && <ChargeCurve curve={curve} pI={pp.pI} />}
          <div className="metrics">
            <div className="metric"><small>Ext. coefficient, 280 nm (M⁻¹cm⁻¹)</small><b className="sm">{pp.extinction.toLocaleString()}</b></div>
            <div className="metric"><small>GRAVY</small><b className="sm">{fmt(pp.gravy, 3)}</b></div>
          </div>
          {focus === 'mw' && <div className="stack-xs"><p className="label">Amino-acid composition</p><div className="tags">{comp.map(([a, n]) => <span key={a} className="tag">{a} {n} · {fmt((100 * n) / seq.length, 1)}%</span>)}</div></div>}
        </>}
      </div>
    </div>
  );
}
function ChargeCurve({ curve, pI }: { curve: { ph: number; q: number }[]; pI: number }) {
  const W = 600, H = 170, max = Math.max(...curve.map((c) => Math.abs(c.q))) || 1;
  const x = (ph: number) => (ph / 14) * W, y = (q: number) => H / 2 - (q / max) * (H / 2 - 10);
  const d = curve.map((c, i) => `${i ? 'L' : 'M'}${x(c.ph).toFixed(1)},${y(c.q).toFixed(1)}`).join('');
  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="spark" style={{ height: 'auto' }} role="img" aria-label={`Net charge against pH; it crosses zero at pH ${pI.toFixed(2)}`}>
      <line className="md" x1="0" x2={W} y1={H / 2} y2={H / 2} />
      <line x1={x(pI)} x2={x(pI)} y1="0" y2={H} stroke="var(--signal)" strokeDasharray="4 4" />
      <path className="ln" d={d} />
      <text x={Math.min(W - 70, x(pI) + 6)} y="14" fontSize="12" style={{ fill: 'var(--signal-ink)' }}>pI {pI.toFixed(2)}</text>
      {[0, 2, 4, 6, 8, 10, 12, 14].map((t) => <text key={t} x={Math.min(W - 8, Math.max(8, x(t)))} y={H + 16} fontSize="11" textAnchor="middle">{t}</text>)}
    </svg>
  );
}

/* ---------------- Codon usage ---------------- */
function CodonTool() {
  const [raw, setRaw] = useState(DNA_EX);
  const text = useDeferredValue(raw);
  const p = useMemo(() => parseInput(toDna(text), 'dna'), [text]);
  const seq = p.records.map((r) => r.seq.slice(0, r.seq.length - (r.seq.length % 3))).join('');
  const u = useMemo(() => codonUsage(seq), [seq]);
  const aas = [...new Set(u.rows.map((r) => r.aa))];
  return (
    <div className="tool-body">
      <div><Input value={raw} set={setRaw} example={DNA_EX} label="In-frame coding sequence(s)" placeholder="Paste a CDS starting at the first base of a codon" />
        {p.records.some((r) => r.seq.length % 3) && <p className="small subtle">A trailing partial codon was ignored in {p.records.filter((r) => r.seq.length % 3).length} record(s).</p>}</div>
      <div>
        <Invalid p={p} kind="DNA" />
        {!u.total ? <Empty>Paste a coding sequence.</Empty> : <>
          <div className="metrics"><div className="metric"><small>Codons counted</small><b>{u.total.toLocaleString()}</b></div><div className="metric"><small>GC at third position</small><b>{fmt(100 * u.rows.filter((r) => /[GC]$/.test(r.codon)).reduce((n, r) => n + r.count, 0) / u.total, 1)}<em>%</em></b></div>{u.skipped > 0 && <div className="metric"><small>Ambiguous codons</small><b>{u.skipped}</b></div>}</div>
          <div className="dtable-wrap" tabIndex={0} role="region" aria-label="Results table" style={{ maxHeight: 460 }}><table className="dtable"><thead><tr><th scope="col">AA</th><th scope="col">Codon</th><th scope="col">Count</th><th scope="col">/1000</th><th scope="col">Fraction</th><th scope="col">RSCU</th></tr></thead>
            <tbody>{aas.map((aa) => u.rows.filter((r) => r.aa === aa).map((r, i) => <tr key={r.codon}><td style={{ fontWeight: i ? 400 : 600 }}>{i ? '' : aa === '*' ? 'Stop' : aa}</td><td className="mono">{r.codon}</td><td>{r.count}</td><td>{fmt(r.perThousand, 1)}</td><td>{fmt(r.fraction)}</td><td style={{ color: r.rscu > 1.3 ? 'var(--brand)' : r.rscu < 0.6 ? 'var(--ink-3)' : undefined, fontWeight: r.rscu > 1.3 ? 600 : 400 }}>{fmt(r.rscu)}</td></tr>))}</tbody></table></div>
          <div><Download text={['aa\tcodon\tcount\tper_thousand\tfraction\trscu', ...u.rows.map((r) => `${r.aa}\t${r.codon}\t${r.count}\t${r.perThousand.toFixed(2)}\t${r.fraction.toFixed(3)}\t${r.rscu.toFixed(3)}`)].join('\n')} name="codon_usage.tsv" /></div>
        </>}
      </div>
    </div>
  );
}

/* ---------------- FASTA validator ---------------- */
function FastaTool() {
  const [raw, setRaw] = useState(FASTA_EX);
  const [alpha, setAlpha] = useState<'dna' | 'rna' | 'protein'>('dna');
  const [width, setWidth] = useState(60);
  const text = useDeferredValue(raw);
  const v = useMemo(() => validateFasta(text, alpha), [text, alpha]);
  const errs = v.issues.filter((i) => i.level === 'error'), warns = v.issues.filter((i) => i.level === 'warning');
  const cleaned = useMemo(() => { const p = parseInput(text, alpha); const seen = new Map<string, number>(); return wrapFasta(p.records.map((r) => { const n = (seen.get(r.id) ?? 0) + 1; seen.set(r.id, n); return { id: n > 1 ? `${r.id}_${n}` : r.id, seq: r.seq }; }), width); }, [text, alpha, width]);
  return (
    <div className="tool-body">
      <div className="stack-md"><Input value={raw} set={setRaw} example={FASTA_EX} label="FASTA file contents" placeholder={'>id description\nSEQUENCE'} />
        <div className="seg" role="group" aria-label="Sequence type">{(['dna', 'rna', 'protein'] as const).map((a) => <button type="button" key={a} aria-pressed={alpha === a} onClick={() => setAlpha(a)}>{a === 'protein' ? 'Protein' : a.toUpperCase()}</button>)}</div></div>
      <div>
        {!errs.length && !warns.length && raw.trim() ? <div className="notice notice--ok" role="status"><I.Check width={17} height={17} /><span><b>Valid FASTA.</b> {v.records.length} record{v.records.length === 1 ? '' : 's'}, {v.records.reduce((n, r) => n + r.length, 0).toLocaleString()} residues.</span></div>
          : <p className="small muted" role="status"><b style={{ color: errs.length ? 'var(--err)' : 'var(--ink)' }}>{errs.length} error{errs.length === 1 ? '' : 's'}</b>, {warns.length} warning{warns.length === 1 ? '' : 's'} · {v.records.length} record{v.records.length === 1 ? '' : 's'}</p>}
        {v.issues.map((i, k) => <div key={k} className={`notice ${i.level === 'error' ? 'notice--err' : 'notice--caution'}`}><I.Alert width={16} height={16} /><span>{i.line && <b className="mono" style={{ marginRight: 6 }}>Line {i.line}:</b>}{i.msg}</span></div>)}
        {cleaned && <div className="stack-xs"><div className="tool-row"><label htmlFor="fw">Reformatted output ({width} per line; invalid characters removed, duplicate IDs renamed)</label><select id="fw" className="control" style={{ width: 'auto', height: 36 }} value={width} onChange={(e) => setWidth(+e.target.value)}>{[50, 60, 70, 80, 100].map((w) => <option key={w}>{w}</option>)}</select></div><div className="out"><CopyBtn text={cleaned} />{cleaned}</div><div><Download text={cleaned} name="cleaned.fasta" /></div></div>}
      </div>
    </div>
  );
}

/* ---------------- Primer Tm ---------------- */
function TmTool() {
  const [seq, setSeq] = useState('AGCGGATAACAATTTCACACAGGA');
  const [na, setNa] = useState(50), [mg, setMg] = useState(1.5), [dntp, setDntp] = useState(0.2), [conc, setConc] = useState(250);
  const s = seq.toUpperCase().replace(/\s/g, '').replace(/U/g, 'T');
  const bad = /[^ACGT]/.test(s);
  const r = useMemo(() => (s.length >= 8 && !bad ? oligoTm(s, { naMM: na, mgMM: mg, dntpMM: dntp, primerNM: conc }) : null), [s, bad, na, mg, dntp, conc]);
  const wallace = [...s].reduce((t, c) => t + (c === 'G' || c === 'C' ? 4 : 2), 0);
  const num = (id: string, label: string, v: number, set: (n: number) => void, step: number, unit: string) => <div className="fld"><label htmlFor={id}>{label} ({unit})</label><input id={id} className="control mono" type="number" inputMode="decimal" step={step} min={0} value={v} onChange={(e) => set(Math.max(0, +e.target.value))} /></div>;
  const checks = r ? [
    { ok: r.length >= 18 && r.length <= 25, t: `Length ${r.length} nt`, d: '18–25 nt is typical' },
    { ok: r.gc >= 0.4 && r.gc <= 0.6, t: `GC ${(r.gc * 100).toFixed(0)}%`, d: '40–60% recommended' },
    { ok: r.tm >= 52 && r.tm <= 68, t: `Tm ${r.tm.toFixed(1)} °C`, d: '55–65 °C is common for PCR' },
    { ok: r.threePrimeGC >= 1 && r.threePrimeGC <= 3, t: `3′ end: ${r.threePrimeGC} G/C in the last 5`, d: '1–3 gives a good GC clamp' },
    { ok: !r.hairpinRisk, t: r.hairpinRisk ? 'Possible hairpin' : 'No obvious hairpin', d: '4-bp self-complementary stem check' },
    { ok: !r.selfDimerRisk, t: r.selfDimerRisk ? 'Possible 3′ self-dimer' : 'No obvious 3′ self-dimer', d: '3′ tail complementarity check' },
  ] : [];
  return (
    <div className="tool-body">
      <div className="stack-md">
        <div className="fld"><label htmlFor="tm-seq">Primer sequence (5′→3′)</label><input id="tm-seq" className="control mono" value={seq} onChange={(e) => setSeq(e.target.value)} spellCheck={false} aria-invalid={bad || undefined} aria-describedby={bad ? 'tm-err' : undefined} />{bad && <span className="fld-err" id="tm-err"><I.Alert width={14} height={14} />Only A, C, G and T are allowed in a primer for this calculation.</span>}</div>
        <div className="form-row">{num('tm-na', 'Na⁺ / K⁺', na, setNa, 5, 'mM')}{num('tm-mg', 'Mg²⁺', mg, setMg, 0.1, 'mM')}</div>
        <div className="form-row">{num('tm-dntp', 'dNTPs', dntp, setDntp, 0.05, 'mM')}{num('tm-conc', 'Primer', conc, setConc, 10, 'nM')}</div>
      </div>
      <div>
        {!r ? <Empty>{bad ? 'Correct the sequence to calculate Tm.' : 'Enter at least 8 nucleotides.'}</Empty> : <>
          <div className="metrics">
            <div className="metric"><small>Tm, nearest-neighbour</small><b>{r.tm.toFixed(1)}<em>°C</em></b></div>
            <div className="metric"><small>ΔG at 37 °C</small><b>{r.dG37.toFixed(1)}<em>kcal/mol</em></b></div>
            <div className="metric"><small>Wallace rule</small><b>{wallace}<em>°C</em></b></div>
          </div>
          <div className="stack-xs">{checks.map((c) => <div key={c.t} className={`notice ${c.ok ? 'notice--ok' : 'notice--caution'}`}>{c.ok ? <I.Check width={16} height={16} /> : <I.Alert width={16} height={16} />}<span><b>{c.t}</b> · {c.d}</span></div>)}</div>
          <div className="out"><CopyBtn text={transform(s, 'revcomp')} /><span className="h">Reverse complement</span>{'\n'}{transform(s, 'revcomp')}</div>
        </>}
      </div>
    </div>
  );
}

/* ---------------- Pairwise alignment ---------------- */
function AlignTool() {
  const [a, setA] = useState(PROT_EX);
  const [b, setB] = useState(PROT_EX2);
  const [mode, setMode] = useState<'global' | 'local'>('global');
  const [kindSel, setKindSel] = useState<'auto' | 'dna' | 'protein'>('auto');
  const da = useDeferredValue(a), db = useDeferredValue(b);
  const res = useMemo(() => {
    const looksDna = (t: string) => { const s = t.replace(/^>.*$/gm, '').replace(/[\s\d]/g, '').toUpperCase(); return s.length > 0 && /^[ACGTUN]+$/.test(s); };
    const kind = kindSel === 'auto' ? (looksDna(da) && looksDna(db) ? 'dna' : 'protein') : kindSel;
    const pa = parseInput(kind === 'dna' ? toDna(da) : da, kind), pb = parseInput(kind === 'dna' ? toDna(db) : db, kind);
    const sa = pa.records[0]?.seq.replace(/\*/g, '') ?? '', sb = pb.records[0]?.seq.replace(/\*/g, '') ?? '';
    if (!sa || !sb) return { kind, pa, pb, err: null as string | null, aln: null };
    try { return { kind, pa, pb, err: null, aln: align(sa, sb, { mode, kind }), ids: [pa.records[0].id, pb.records[0].id] }; }
    catch (e) { return { kind, pa, pb, err: (e as Error).message, aln: null }; }
  }, [da, db, mode, kindSel]);
  const block = useMemo(() => {
    const r = res.aln; if (!r) return '';
    const W = 60, lines: string[] = [];
    let ia = r.aStart, ib = r.bStart;
    const na = ('ids' in res && res.ids ? res.ids[0] : 'A').slice(0, 10).padEnd(10), nb = ('ids' in res && res.ids ? res.ids[1] : 'B').slice(0, 10).padEnd(10);
    for (let k = 0; k < r.a.length; k += W) {
      const sa = r.a.slice(k, k + W), sb = r.b.slice(k, k + W), m = r.mid.slice(k, k + W);
      const ea = ia + sa.replace(/-/g, '').length - 1, eb = ib + sb.replace(/-/g, '').length - 1;
      lines.push(`${na} ${String(ia).padStart(5)} ${sa} ${ea}`, `${' '.repeat(17)}${m}`, `${nb} ${String(ib).padStart(5)} ${sb} ${eb}`, '');
      ia = ea + 1; ib = eb + 1;
    }
    return lines.join('\n');
  }, [res]);
  return (
    <div className="tool-body">
      <div className="stack-md">
        <Input id="tool-in" value={a} set={setA} example={PROT_EX} label="Sequence A (raw or FASTA)" placeholder="Paste the first sequence" short />
        <Input id="tool-in-b" value={b} set={setB} example={PROT_EX2} label="Sequence B (raw or FASTA)" placeholder="Paste the second sequence" short />
        <div className="inline">
          <div className="seg" role="group" aria-label="Alignment mode">{([['global', 'Global'], ['local', 'Local']] as const).map(([k, l]) => <button type="button" key={k} aria-pressed={mode === k} onClick={() => setMode(k)}>{l}</button>)}</div>
          <div className="seg" role="group" aria-label="Sequence type">{([['auto', 'Auto-detect'], ['dna', 'DNA'], ['protein', 'Protein']] as const).map(([k, l]) => <button type="button" key={k} aria-pressed={kindSel === k} onClick={() => setKindSel(k)}>{l}</button>)}</div>
        </div>
      </div>
      <div>
        <Invalid p={res.pa} kind={res.kind === 'dna' ? 'DNA' : 'amino-acid'} />
        <Invalid p={res.pb} kind={res.kind === 'dna' ? 'DNA' : 'amino-acid'} />
        {res.err ? <div className="notice notice--err" role="alert"><I.Alert width={17} height={17} /><span>{res.err}</span></div>
          : !res.aln ? <Empty>Paste two sequences to align them.</Empty> : <>
            <p className="small subtle">{mode === 'global' ? 'Global (Needleman–Wunsch)' : 'Local (Smith–Waterman)'} alignment of {res.kind === 'dna' ? 'DNA' : 'protein'} sequences, {res.kind === 'dna' ? 'match +2, mismatch −3, gap open 5, extend 2' : 'BLOSUM62, gap open 11, extend 1'}.</p>
            <div className="metrics">
              <div className="metric"><small>Score</small><b>{res.aln.score}</b></div>
              <div className="metric"><small>Identity</small><b>{fmt(res.aln.identity * 100, 1)}<em>%</em></b></div>
              {res.kind === 'protein' && <div className="metric"><small>Similarity</small><b>{fmt(res.aln.similarity * 100, 1)}<em>%</em></b></div>}
              <div className="metric"><small>Gaps</small><b>{res.aln.gaps}</b></div>
              <div className="metric"><small>Length</small><b>{res.aln.length}</b></div>
            </div>
            <div className="aln" tabIndex={0} role="region" aria-label="Alignment">{block}</div>
            <div className="inline"><Download text={block} name="alignment.txt" /></div>
          </>}
      </div>
    </div>
  );
}

/* ---------------- Restriction sites ---------------- */
const LADDER = [10000, 5000, 3000, 2000, 1000, 500, 250];
function DigestTool() {
  const [raw, setRaw] = useState(DNA_EX);
  const [circular, setCircular] = useState(false);
  const [sel, setSel] = useState<string[]>(['EcoRI', 'HindIII']);
  const text = useDeferredValue(raw);
  const p = useMemo(() => parseInput(toDna(text), 'dna'), [text]);
  const seq = p.records[0]?.seq ?? '';
  const counts = useMemo(() => Object.fromEntries(ENZYMES.map((e) => [e.name, seq ? digest(seq, [e.name], circular).sites.length : 0])), [seq, circular]);
  const d = useMemo(() => (seq ? digest(seq, sel, circular) : null), [seq, sel, circular]);
  const toggle = (n: string) => setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  const singles = ENZYMES.filter((e) => counts[e.name] === 1).map((e) => e.name);
  const lo = Math.log10(100), hi = Math.log10(12000);
  const yOf = (bp: number) => 8 + ((hi - Math.log10(Math.min(12000, Math.max(100, bp)))) / (hi - lo)) * 200;
  return (
    <div className="tool-body">
      <div className="stack-md">
        <Input value={raw} set={setRaw} example={DNA_EX} label="DNA sequence (raw or FASTA)" placeholder="Paste a plasmid, PCR product or genomic fragment" short />
        <div className="inline"><span className="lbl small" style={{ fontWeight: 500 }}>Topology</span><div className="seg" role="group" aria-label="Topology">{([['Linear', false], ['Circular', true]] as const).map(([l, v]) => <button type="button" key={l} aria-pressed={circular === v} onClick={() => setCircular(v)}>{l}</button>)}</div></div>
        <div className="stack-xs">
          <div className="tool-row"><span className="lbl">Enzymes ({sel.length} selected)</span><div className="inline" style={{ gap: 6 }}><button type="button" className="button button--ghost button--sm" onClick={() => setSel(singles)} disabled={!singles.length}>Single cutters</button><button type="button" className="button button--ghost button--sm" onClick={() => setSel([])} disabled={!sel.length}>Clear</button></div></div>
          <div className="chips-row" role="group" aria-label="Restriction enzymes">{ENZYMES.map((e) => <button type="button" key={e.name} className="chip" aria-pressed={sel.includes(e.name)} onClick={() => toggle(e.name)} title={`${e.site} · ${e.overhang}`}>{e.name}<span className="ct">{counts[e.name]}×</span></button>)}</div>
        </div>
      </div>
      <div>
        <Invalid p={p} kind="DNA" />
        {!seq ? <Empty>Paste a DNA sequence to map restriction sites.</Empty> : !d || !sel.length ? <Empty>Select one or more enzymes to simulate a digest.</Empty> : <>
          <div className="metrics"><div className="metric"><small>Length</small><b>{seq.length.toLocaleString()}<em>bp</em></b></div><div className="metric"><small>Cut sites</small><b>{d.sites.length}</b></div><div className="metric"><small>Fragments</small><b>{d.fragments.length}</b></div></div>
          <div className="split-5-7 align-start" style={{ gap: 20 }}>
            <figure className="figure" style={{ margin: 0 }}>
              <div className="gel" role="img" aria-label={`Virtual agarose gel: ladder and ${d.fragments.length} fragment${d.fragments.length > 1 ? 's' : ''} of ${d.fragments.join(', ')} bp`}>
                <div className="gel-lane">{LADDER.map((s) => <span key={s} className="gel-band ladder" style={{ top: yOf(s) }}><span className="gel-lbl">{s >= 1000 ? `${s / 1000} kb` : s}</span></span>)}</div>
                <div className="gel-lane">{d.fragments.filter((f) => f >= 100 && f <= 12000).map((f, i) => <span key={i} className="gel-band" style={{ top: yOf(f) }} />)}</div>
              </div>
              <figcaption className="figcaption">Ladder (left) and digest (right) on a simulated 1% agarose gel.{d.fragments.some((f) => f < 100) && ` ${d.fragments.filter((f) => f < 100).length} fragment${d.fragments.filter((f) => f < 100).length > 1 ? 's' : ''} below 100 bp ran off the gel.`}</figcaption>
            </figure>
            <div className="stack-sm">
              <div className="dtable-wrap" tabIndex={0} role="region" aria-label="Results table" style={{ maxHeight: 260 }}><table className="dtable"><thead><tr><th scope="col">Enzyme</th><th scope="col">Position</th><th scope="col">Overhang</th></tr></thead><tbody>{d.sites.length ? d.sites.map((s, i) => { const e = ENZYMES.find((x) => x.name === s.enzyme)!; return <tr key={i}><td>{s.enzyme}</td><td>{s.pos.toLocaleString()}</td><td className="mono">{e.overhang}</td></tr>; }) : <tr><td colSpan={3}>No sites for the selected enzymes.</td></tr>}</tbody></table></div>
              <p className="small muted"><b style={{ color: 'var(--ink)' }}>Fragments (bp):</b> {d.fragments.map((f) => f.toLocaleString()).join(', ')}</p>
            </div>
          </div>
        </>}
      </div>
    </div>
  );
}

export const WIDGETS: Record<string, () => React.JSX.Element> = {
  'gc-content-calculator': GcTool,
  'reverse-complement': RevCompTool,
  'dna-to-protein-translator': TranslateTool,
  'orf-finder': OrfTool,
  'protein-molecular-weight-calculator': () => <ProteinTool focus="mw" />,
  'protein-isoelectric-point-calculator': () => <ProteinTool focus="pi" />,
  'codon-usage-calculator': CodonTool,
  'fasta-validator': FastaTool,
  'primer-tm-calculator': TmTool,
  'pairwise-sequence-alignment': AlignTool,
  'restriction-site-finder': DigestTool,
};
