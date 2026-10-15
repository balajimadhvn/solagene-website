// Scientific figures drawn as SVG: the site's visual language instead of stock imagery or decorative art.
// Every figure is simulated data, deterministic (seeded generator, basic arithmetic only, so the server-rendered
// SVG and the hydrated one are identical) and themed through CSS classes (.f1… in site.css), so dark mode works.
import type { ReactNode } from 'react';
import { align } from '@/studios/sequence/kernels';

/* ---------- helpers ---------- */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** Approximately standard-normal deviate (Irwin–Hall, n = 4): no transcendental functions, identical in every engine. */
const gauss = (r: () => number) => (r() + r() + r() + r() - 2) * 1.7320508;
const f = (n: number) => (Math.round(n * 10) / 10).toString();
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
type Bare = { bare?: boolean };

export function Figure({ n, caption, children, flush, className = '' }: { n?: number | string; caption?: ReactNode; children: ReactNode; flush?: boolean; className?: string }) {
  return (
    <figure className={`figure ${className}`}>
      <div className={`figure-frame ${flush ? 'figure-frame--flush' : ''}`}>{children}</div>
      {caption && <figcaption className="figcaption">{n !== undefined && <b>Fig. {n}</b>}{caption}</figcaption>}
    </figure>
  );
}

/** Axes with tick labels for a standard 360×240 panel. */
function Axes({ x0, x1, y0, y1, xt, yt, xl, yl, bare }: { x0: number; x1: number; y0: number; y1: number; xt?: { v: number; x: number; t: string }[]; yt?: { v: number; y: number; t: string }[]; xl?: string; yl?: string; bare?: boolean }) {
  return (
    <g>
      <path className="ax" d={`M${x0},${y0}V${y1}H${x1}`} />
      {!bare && xt?.map((t) => <g key={'x' + t.t}><path className="ax" d={`M${f(t.x)},${y1}v4`} /><text x={f(t.x)} y={y1 + 15} fontSize="9.5" textAnchor="middle">{t.t}</text></g>)}
      {!bare && yt?.map((t) => <g key={'y' + t.t}><path className="ax" d={`M${x0},${f(t.y)}h-4`} /><text x={x0 - 7} y={f(t.y + 3)} fontSize="9.5" textAnchor="end">{t.t}</text></g>)}
      {!bare && xl && <text x={(x0 + x1) / 2} y={y1 + 30} fontSize="10" textAnchor="middle" className="t-ink">{xl}</text>}
      {!bare && yl && <text x={12} y={(y0 + y1) / 2} fontSize="10" textAnchor="middle" className="t-ink" transform={`rotate(-90 12 ${(y0 + y1) / 2})`}>{yl}</text>}
    </g>
  );
}

/* ---------- A. coverage, pileup and gene model (HTML labels + SVG marks, legible at any width) ---------- */
const EXONS: [number, number][] = [[0.3, 0.62], [1.25, 1.42], [2.05, 2.38], [3.0, 3.16], [3.85, 4.7]]; // kb
const SNV = 2.22; // kb, inside exon 3
const KB = 5, W = 600;
const px = (kb: number) => (kb / KB) * W;
function coverageAt(kb: number) {
  let c = 0.035;
  EXONS.forEach(([a, b], i) => { const m = (a + b) / 2, h = (b - a) / 2 + 0.03, d = (kb - m) / h; if (d > -1 && d < 1) { const s = 1 - d * d * d * d; c += s * (0.42 + i * 0.13); } });
  return clamp(c, 0, 1);
}
export function CoverageTracks({ ruler = true }: { ruler?: boolean }) {
  const r = rng(11);
  const bins = 120, bw = W / bins, H = 64;
  const vals = Array.from({ length: bins }, (_, i) => clamp(coverageAt((i + 0.5) * (KB / bins)) * (0.9 + r() * 0.2), 0, 1));
  let d = `M0,${H}`, len = 0, py = H;
  vals.forEach((v, i) => { const y = H - 2 - v * (H - 6); d += `V${f(y)}H${f((i + 1) * bw)}`; len += Math.abs(py - y) + bw; py = y; });
  d += `V${H}`; len += Math.abs(py - H);
  const vb = Math.floor(px(SNV) / bw), vy = H - 2 - vals[vb] * (H - 6), alt = 0.46;
  // reads: spliced where they cross an intron
  const reads: { segs: [number, number][]; row: number; mm: boolean }[] = [];
  const rows = 7, rowEnd = new Array(rows).fill(-1);
  const starts: number[] = [];
  EXONS.forEach(([a, b], i) => { const n = 3 + i * 2; for (let k = 0; k < n; k++) starts.push(a + r() * (b - a)); });
  starts.sort((x, y) => x - y).forEach((s) => {
    const ex = EXONS.findIndex(([a, b]) => s >= a && s <= b);
    const L = 0.11; let segs: [number, number][];
    const [, b] = EXONS[ex];
    if (s + L > b && ex < EXONS.length - 1) { const rem = s + L - b; segs = [[s, b], [EXONS[ex + 1][0], EXONS[ex + 1][0] + rem]]; } else segs = [[s, Math.min(s + L, EXONS[ex][1] + 0.02)]];
    const row = rowEnd.findIndex((e) => e < s - 0.02);
    if (row < 0) return;
    rowEnd[row] = segs[segs.length - 1][1];
    const covers = segs.some(([x, y]) => SNV >= x && SNV <= y);
    reads.push({ segs, row, mm: covers && r() < 0.5 });
  });
  const RH = 7, gap = 4, rh = rows * (RH + gap);
  return (
    <div className="tracks">
      {ruler && <><span className="tl" aria-hidden /><div className="ruler" aria-hidden>{[0, 1, 2, 3, 4, 5].map((k) => <span key={k} style={{ left: `${(k / KB) * 100}%` }}>{k ? `${k} kb` : '0'}</span>)}</div></>}
      <span className="tl">Coverage</span>
      <svg className="fx" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <path className="area1 fade" d={d} style={{ ['--d' as string]: '0.5s' }} />
        <path className="s1 draw" d={d} strokeWidth="1.2" vectorEffect="non-scaling-stroke" style={{ ['--len' as string]: Math.ceil(len) + 40 }} />
        <rect className="f2 pop" x={f(vb * bw)} y={f(vy)} width={f(bw)} height={f((H - 2 - vy) * alt)} style={{ ['--d' as string]: '1.4s' }} />
      </svg>
      <span className="tl">Reads</span>
      <svg className="fx" viewBox={`0 0 ${W} ${rh}`} aria-hidden>
        {reads.map((rd, i) => {
          const y = rd.row * (RH + gap);
          const x0 = px(rd.segs[0][0]);
          return (
            <g key={i} className="fade" style={{ ['--d' as string]: `${(0.25 + (x0 / W) * 0.9).toFixed(2)}s` }}>
              {rd.segs.length > 1 && <line x1={f(px(rd.segs[0][1]))} x2={f(px(rd.segs[1][0]))} y1={y + RH / 2} y2={y + RH / 2} className="s5" strokeWidth="1" />}
              {rd.segs.map(([a, b], j) => <rect key={j} x={f(px(a))} y={y} width={f(Math.max(2, px(b) - px(a)))} height={RH} className="f3" />)}
              {rd.mm && <rect x={f(px(SNV) - 1.5)} y={y} width="3.5" height={RH} className="f2" />}
            </g>
          );
        })}
      </svg>
      <span className="tl">Gene</span>
      <svg className="fx" viewBox={`0 0 ${W} 24`} aria-hidden>
        <line x1={f(px(EXONS[0][0]))} x2={f(px(EXONS[4][1]))} y1="12" y2="12" className="si" strokeWidth="1" />
        {EXONS.slice(0, -1).map(([, b], i) => { const m = (px(b) + px(EXONS[i + 1][0])) / 2; return <path key={i} d={`M${f(m - 3)},9l3,3-3,3`} className="si" strokeWidth="1" />; })}
        {EXONS.map(([a, b], i) => {
          const utr5 = i === 0 ? 0.08 : 0, utr3 = i === 4 ? 0.5 : 0;
          return <g key={i} className="fade" style={{ ['--d' as string]: `${0.15 + i * 0.08}s` }}>
            {utr5 > 0 && <rect x={f(px(a))} y="8" width={f(px(a + utr5) - px(a))} height="8" className="fi" />}
            <rect x={f(px(a + utr5))} y="4" width={f(px(b - utr3) - px(a + utr5))} height="16" className="fi" />
            {utr3 > 0 && <rect x={f(px(b - utr3))} y="8" width={f(px(b) - px(b - utr3))} height="8" className="fi" />}
          </g>;
        })}
      </svg>
    </div>
  );
}

/* ---------- B. volcano plot ---------- */
export function Volcano({ bare, seed = 7 }: Bare & { seed?: number }) {
  const r = rng(seed);
  const X0 = 40, X1 = 348, Y0 = 12, Y1 = 204;
  const sx = (v: number) => X0 + ((v + 5) / 10) * (X1 - X0), sy = (v: number) => Y1 - (v / 10) * (Y1 - Y0);
  const pts = Array.from({ length: 300 }, (_, i) => {
    const de = i % 8 === 0;
    const x = de ? (r() < 0.5 ? -1 : 1) * (1.1 + r() * 2.9) : gauss(r) * 0.75;
    const y = de ? 1.6 + Math.abs(x) * 1.55 + r() * 1.6 : Math.abs(x) * (0.55 + r() * 0.6) + r() * 0.5;
    return { x: clamp(x, -4.8, 4.8), y: clamp(y, 0, 9.7) };
  });
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      <Axes x0={X0} x1={X1} y0={Y0} y1={Y1} bare={bare} xl="log₂ fold change" yl="−log₁₀ adjusted p"
        xt={[-4, -2, 0, 2, 4].map((v) => ({ v, x: sx(v), t: String(v) }))} yt={[0, 5, 10].map((v) => ({ v, y: sy(v), t: String(v) }))} />
      <path className="thr" d={`M${f(sx(-1))},${Y0}V${Y1}M${f(sx(1))},${Y0}V${Y1}M${X0},${f(sy(1.3))}H${X1}`} />
      {pts.map((p, i) => { const sig = p.y > 1.3 && Math.abs(p.x) > 1; return <circle key={i} cx={f(sx(p.x))} cy={f(sy(p.y))} r={sig ? 2.6 : 1.9} className={`${sig ? (p.x > 0 ? 'f2' : 'f1') : 'f3'} ${sig ? 'pop' : 'fade'}`} style={{ ['--d' as string]: `${(0.2 + (i % 40) * 0.012).toFixed(3)}s` }} />; })}
    </svg>
  );
}

/* ---------- C. single-cell embedding ---------- */
const CLUSTERS = [{ x: 0.28, y: 0.32, s: 0.07, n: 110, c: 'f1' }, { x: 0.66, y: 0.24, s: 0.06, n: 80, c: 'f2' }, { x: 0.74, y: 0.62, s: 0.075, n: 90, c: 'f4' }, { x: 0.36, y: 0.72, s: 0.055, n: 60, c: 'f5' }, { x: 0.52, y: 0.5, s: 0.035, n: 30, c: 'f6' }];
export function Umap({ bare }: Bare) {
  const r = rng(23);
  const W2 = 360, H2 = 240;
  return (
    <svg className="fx" viewBox={`0 0 ${W2} ${H2}`} aria-hidden>
      {CLUSTERS.map((c, k) => Array.from({ length: c.n }, (_, i) => {
        const x = clamp(c.x + gauss(r) * c.s * 1.25, 0.04, 0.97), y = clamp(c.y + gauss(r) * c.s, 0.05, 0.9);
        return <circle key={`${k}-${i}`} cx={f(x * W2)} cy={f(y * H2)} r="2.1" className={`${c.c} fade`} fillOpacity="0.85" style={{ ['--d' as string]: `${(0.15 + k * 0.12 + (i % 10) * 0.01).toFixed(2)}s` }} />;
      }))}
      {!bare && CLUSTERS.map((c, k) => <text key={'l' + k} x={f(c.x * W2 + c.s * W2 * 1.1 + 4)} y={f(c.y * H2 - c.s * H2 * 0.9)} fontSize="10" className="t-ink t-b">C{k + 1}</text>)}
      <path className="ax" d={`M12,${H2 - 12}h28M12,${H2 - 12}v-28`} />
      {!bare && <><text x="44" y={H2 - 9} fontSize="9">UMAP 1</text><text x="9" y={H2 - 46} fontSize="9" transform={`rotate(-90 9 ${H2 - 46})`}>UMAP 2</text></>}
    </svg>
  );
}

/* ---------- D. protein–ligand interaction diagram ---------- */
export function Interaction({ bare }: Bare) {
  // Ligand: phenol ring – amide – saturated ring. Coordinates in a 360×240 box.
  const DIRS = [[1, 0], [0.5, 0.866], [-0.5, 0.866], [-1, 0], [-0.5, -0.866], [0.5, -0.866]];
  const hex = (cx: number, cy: number, R: number) => DIRS.map(([dx, dy]) => [cx + dx * R, cy + dy * R] as const);
  const A = hex(132, 128, 24), B = hex(262, 128, 24);
  const ring = (p: readonly (readonly [number, number])[]) => `M${p.map(([x, y]) => `${f(x)},${f(y)}`).join('L')}Z`;
  const inner = [[A[0], A[1]], [A[2], A[3]], [A[4], A[5]]].map(([p, q]) => { const cx = 132, cy = 128, k = 0.78; return `M${f(cx + (p[0] - cx) * k)},${f(cy + (p[1] - cy) * k)}L${f(cx + (q[0] - cx) * k)},${f(cy + (q[1] - cy) * k)}`; }).join('');
  const C = [A[0][0] + 26, 128] as const, O = [C[0], 128 - 28] as const, N = [C[0] + 26, 128 + 14] as const, OH = [A[3][0] - 26, 128] as const;
  const res = [
    { t: 'Asp25', x: 70, y: 46, to: OH, d: '2.8 Å', hb: true }, { t: 'Gly27', x: 196, y: 30, to: O, d: '3.0 Å', hb: true }, { t: 'Asp29', x: 212, y: 214, to: N, d: '3.1 Å', hb: true },
    { t: 'Ile50', x: 318, y: 50, to: B[5], d: '', hb: false }, { t: 'Val82', x: 320, y: 206, to: B[1], d: '', hb: false }, { t: 'Leu23', x: 52, y: 200, to: A[2], d: '', hb: false },
  ];
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      {res.map((p, i) => <path key={'c' + i} d={`M${f(p.x)},${f(p.y)}L${f(p.to[0])},${f(p.to[1])}`} className={`${p.hb ? 's1' : 's4'} fade`} strokeWidth="1.3" strokeDasharray={p.hb ? '4 3' : '1.5 3'} style={{ ['--d' as string]: `${0.6 + i * 0.08}s` }} />)}
      <g className="fade" style={{ ['--d' as string]: '0.1s' }}>
        <path d={ring(A)} className="si" strokeWidth="1.6" /><path d={inner} className="si" strokeWidth="1.6" />
        <path d={ring(B)} className="si" strokeWidth="1.6" />
        <path d={`M${f(A[0][0])},128L${f(C[0])},128L${f(N[0])},${f(N[1])}L${f(B[3][0])},128M${f(C[0] - 2.5)},128V${f(O[1] + 9)}M${f(C[0] + 2.5)},128V${f(O[1] + 9)}M${f(A[3][0])},128H${f(OH[0] + 12)}`} className="si" strokeWidth="1.6" />
        {!bare && <><text x={f(O[0])} y={f(O[1] + 4)} fontSize="12" textAnchor="middle" className="t-ink t-b">O</text><text x={f(N[0])} y={f(N[1] + 14)} fontSize="12" textAnchor="middle" className="t-ink t-b">NH</text><text x={f(OH[0] + 2)} y={f(OH[1] + 4)} fontSize="12" textAnchor="middle" className="t-ink t-b">HO</text></>}
      </g>
      {res.map((p, i) => (
        <g key={'r' + i} className="pop" style={{ ['--d' as string]: `${0.4 + i * 0.07}s` }}>
          <rect x={f(p.x - 24)} y={f(p.y - 10)} width="48" height="20" rx="2" className="fp" stroke={p.hb ? 'var(--viz-1)' : 'var(--viz-4)'} strokeWidth="1.2" />
          {!bare && <text x={f(p.x)} y={f(p.y + 3.5)} fontSize="10" textAnchor="middle" className="t-ink">{p.t}</text>}
        </g>
      ))}
      {!bare && res.filter((p) => p.d).map((p, i) => { const mx = (p.x + p.to[0]) / 2, my = (p.y + p.to[1]) / 2; return <text key={'d' + i} x={f(mx + 6)} y={f(my - 3)} fontSize="9" className="fade" style={{ ['--d' as string]: '1.2s' }}>{p.d}</text>; })}
    </svg>
  );
}

/* ---------- variant pileup (NGS) ---------- */
export function Pileup({ bare }: Bare) {
  const r = rng(5);
  const ref = 'GCTGACCTAGGTCATGCAGTTCAGGAGCT';
  const n = ref.length, cw = 336 / n, x0 = 14, vc = 14; // variant column
  const rows = Array.from({ length: 11 }, (_, i) => { const s = Math.floor(r() * 6), e = n - Math.floor(r() * 6); return { s, e, alt: (i * 7) % 11 < 5, del: i === 6 }; });
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      {!bare ? ref.split('').map((b, i) => <text key={i} x={f(x0 + i * cw + cw / 2)} y="18" fontSize="10.5" textAnchor="middle" className={i === vc ? 't-ink t-b' : ''}>{b}</text>) : <rect x={x0} y="10" width={336} height="6" className="fi" />}
      <rect x={f(x0 + vc * cw)} y="26" width={f(cw)} height="190" className="fp3" />
      {rows.map((rw, i) => {
        const y = 32 + i * 16;
        return <g key={i} className="fade" style={{ ['--d' as string]: `${0.2 + i * 0.06}s` }}>
          <rect x={f(x0 + rw.s * cw)} y={y} width={f((rw.e - rw.s) * cw)} height="10" className="f3" />
          {rw.del && <><rect x={f(x0 + 20 * cw)} y={y} width={f(cw * 2)} height="10" className="fp" /><line x1={f(x0 + 20 * cw)} x2={f(x0 + 22 * cw)} y1={y + 5} y2={y + 5} className="si" strokeWidth="1.5" /></>}
          {rw.alt && vc >= rw.s && vc < rw.e && <rect x={f(x0 + vc * cw + 0.5)} y={y} width={f(cw - 1)} height="10" className="f2 pop" style={{ ['--d' as string]: `${0.9 + i * 0.05}s` }} />}
        </g>;
      })}
      {!bare && <text x={f(x0 + vc * cw + cw / 2)} y="232" fontSize="9.5" textAnchor="middle" className="t-ink">C&gt;T · VAF ≈ 0.5</text>}
    </svg>
  );
}

/* ---------- phylogeny ---------- */
interface Node { l?: string; b: number; s?: number; c?: Node[] }
const TREE: Node = { b: 0, c: [
  { b: 0.04, s: 100, c: [{ b: 0.05, s: 98, c: [{ b: 0.08, s: 100, c: [{ l: 'A', b: 0.05 }, { l: 'B', b: 0.06 }] }, { l: 'C', b: 0.12 }] }, { b: 0.1, s: 87, c: [{ l: 'D', b: 0.09 }, { l: 'E', b: 0.07 }] }] },
  { b: 0.07, s: 95, c: [{ b: 0.06, s: 64, c: [{ l: 'F', b: 0.11 }, { l: 'G', b: 0.1 }] }, { l: 'H', b: 0.18 }] },
] };
export function Tree({ bare }: Bare) {
  const X0 = 18, sc = bare ? 1150 : 1000, rowH = 25, Y0 = 20;
  let leaf = 0;
  const lines: ReactNode[] = [], labels: ReactNode[] = [];
  const walk = (n: Node, x: number, depth: number): number => {
    const x1 = x + n.b * sc;
    let y: number;
    if (n.c) {
      const ys = n.c.map((c) => walk(c, x1, depth + 1));
      y = (ys[0] + ys[ys.length - 1]) / 2;
      lines.push(<path key={`v${x1}${y}`} d={`M${f(x1)},${f(ys[0])}V${f(ys[ys.length - 1])}`} className="si draw" strokeWidth="1.4" style={{ ['--d' as string]: `${0.2 + depth * 0.15}s`, ['--len' as string]: 200 }} />);
      if (n.s !== undefined && !bare) labels.push(<text key={`s${x1}${y}`} x={f(x1 - 3)} y={f(y - 4)} fontSize="9" textAnchor="end">{n.s}</text>);
    } else {
      y = Y0 + leaf++ * rowH;
      labels.push(bare ? <rect key={`l${y}`} x={f(x1 + 4)} y={f(y - 2.5)} width="14" height="5" className="f3" /> : <text key={`l${y}`} x={f(x1 + 6)} y={f(y + 3.5)} fontSize="10" className="t-ink">Taxon {n.l}</text>);
    }
    if (n.b) lines.push(<path key={`h${x}${y}`} d={`M${f(x)},${f(y)}H${f(x1)}`} className="si draw" strokeWidth="1.4" style={{ ['--d' as string]: `${0.1 + depth * 0.15}s`, ['--len' as string]: 200 }} />);
    return y;
  };
  walk(TREE, X0, 0);
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      {lines}{labels}
      <path className="ax" d={`M${X0},226h${f(0.05 * sc)}`} />
      {!bare && <text x={f(X0 + 0.025 * sc)} y="221" fontSize="9" textAnchor="middle">0.05 subst./site</text>}
    </svg>
  );
}

/* ---------- QSAR: predicted vs observed ---------- */
export function Qsar({ bare }: Bare) {
  const r = rng(31);
  const X0 = 40, X1 = 230, Y0 = 14, Y1 = 204;
  const s = (v: number) => (v - 4) / 6;
  const sx = (v: number) => X0 + s(v) * (X1 - X0), sy = (v: number) => Y1 - s(v) * (Y1 - Y0);
  const pts = Array.from({ length: 72 }, (_, i) => { const o = 4.6 + r() * 4.8, out = i % 9 === 4; return { o, p: clamp(o + gauss(r) * (out ? 1.1 : 0.38), 4.1, 9.9), out }; });
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      <Axes x0={X0} x1={X1} y0={Y0} y1={Y1} bare={bare} xl="Observed pIC₅₀" yl="Predicted pIC₅₀" xt={[4, 6, 8, 10].map((v) => ({ v, x: sx(v), t: String(v) }))} yt={[4, 6, 8, 10].map((v) => ({ v, y: sy(v), t: String(v) }))} />
      <path d={`M${f(sx(4))},${f(sy(5))}L${f(sx(9))},${f(sy(10))}L${f(sx(10))},${f(sy(10))}L${f(sx(10))},${f(sy(9))}L${f(sx(5))},${f(sy(4))}L${f(sx(4))},${f(sy(4))}Z`} className="fp2" />
      <path className="si" strokeWidth="1" d={`M${f(sx(4))},${f(sy(4))}L${f(sx(10))},${f(sy(10))}`} />
      {pts.map((p, i) => p.out
        ? <circle key={i} cx={f(sx(p.o))} cy={f(sy(p.p))} r="3.2" className="s2 pop" strokeWidth="1.4" style={{ ['--d' as string]: `${0.3 + (i % 24) * 0.02}s` }} />
        : <circle key={i} cx={f(sx(p.o))} cy={f(sy(p.p))} r="2.6" className="f1 pop" fillOpacity="0.85" style={{ ['--d' as string]: `${0.3 + (i % 24) * 0.02}s` }} />)}
      {!bare && <g transform="translate(250 30)">
        <circle cx="5" cy="0" r="3" className="f1" /><text x="14" y="3.5" fontSize="9.5" className="t-ink">In domain</text>
        <circle cx="5" cy="18" r="3.2" className="s2" strokeWidth="1.4" /><text x="14" y="21.5" fontSize="9.5" className="t-ink">Outside AD</text>
        <rect x="0" y="32" width="10" height="8" className="fp2" stroke="var(--rule-2)" /><text x="14" y="39.5" fontSize="9.5" className="t-ink">±1 log unit</text>
      </g>}
    </svg>
  );
}

/* ---------- microbiome composition ---------- */
const TAXA = ['Bacteroides', 'Prevotella', 'Faecalibacterium', 'Bifidobacterium', 'Akkermansia', 'Other'];
const TAXA_C = ['f1', 'f6', 'f4', 'f2', 'f5', 'f3'];
export function Composition({ bare }: Bare) {
  const r = rng(41);
  const X0 = 36, Y0 = 14, Y1 = 196, bw = 20, gap = 6;
  const samples = Array.from({ length: 8 }, (_, i) => {
    const t = i >= 4;
    const base = t ? [0.2, 0.08, 0.3, 0.18, 0.12, 0.12] : [0.36, 0.18, 0.14, 0.08, 0.06, 0.18];
    const v = base.map((b) => b * (0.75 + r() * 0.5)); const s = v.reduce((a, b) => a + b, 0);
    return v.map((x) => x / s);
  });
  const gx = (i: number) => X0 + i * (bw + gap) + (i >= 4 ? 14 : 0);
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      <Axes x0={X0 - 6} x1={gx(7) + bw + 6} y0={Y0} y1={Y1} bare={bare} yl="Relative abundance" yt={[0, 0.5, 1].map((v) => ({ v, y: Y1 - v * (Y1 - Y0), t: v === 0.5 ? '0.5' : String(v) }))} />
      {samples.map((s, i) => { let acc = 0; return <g key={i} className="fade" style={{ ['--d' as string]: `${0.15 + i * 0.07}s` }}>{s.map((v, k) => { const h = v * (Y1 - Y0), y = Y1 - acc - h; acc += h; return <rect key={k} x={gx(i)} y={f(y)} width={bw} height={f(h)} className={TAXA_C[k]} stroke="var(--paper)" strokeWidth="0.75" />; })}</g>; })}
      {!bare && <><text x={(gx(0) + gx(3) + bw) / 2} y={Y1 + 16} fontSize="9.5" textAnchor="middle" className="t-ink">Control</text><text x={(gx(4) + gx(7) + bw) / 2} y={Y1 + 16} fontSize="9.5" textAnchor="middle" className="t-ink">Treated</text>
        <g transform={`translate(${gx(7) + bw + 18} 22)`}>{TAXA.map((t, k) => <g key={t} transform={`translate(0 ${k * 17})`}><rect width="9" height="9" className={TAXA_C[k]} /><text x="14" y="8" fontSize="9" className="t-ink" fontStyle={k < 5 ? 'italic' : undefined}>{t}</text></g>)}</g></>}
    </svg>
  );
}

/* ---------- ROC curves ---------- */
export function Roc({ bare }: Bare) {
  const X0 = 40, X1 = 222, Y0 = 14, Y1 = 196;
  const sx = (v: number) => X0 + v * (X1 - X0), sy = (v: number) => Y1 - v * (Y1 - Y0);
  const curve = (k: number) => Array.from({ length: 41 }, (_, i) => { const x = i / 40, q = 1 - x; let p = 1; for (let j = 0; j < k; j++) p *= q; return `${i ? 'L' : 'M'}${f(sx(x))},${f(sy(1 - p))}`; }).join('');
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      <Axes x0={X0} x1={X1} y0={Y0} y1={Y1} bare={bare} xl="False positive rate" yl="True positive rate" xt={[0, 0.5, 1].map((v) => ({ v, x: sx(v), t: String(v) }))} yt={[0, 0.5, 1].map((v) => ({ v, y: sy(v), t: String(v) }))} />
      <path className="thr" d={`M${sx(0)},${sy(0)}L${sx(1)},${sy(1)}`} />
      <path className="s3 draw" strokeWidth="1.8" d={curve(2)} style={{ ['--d' as string]: '0.3s', ['--len' as string]: 420 }} />
      <path className="s1 draw" strokeWidth="2" d={curve(5)} style={{ ['--d' as string]: '0.5s', ['--len' as string]: 460 }} />
      {!bare && <g transform="translate(240 40)">
        <path className="s1" strokeWidth="2" d="M0,0h16" /><text x="22" y="3.5" fontSize="9.5" className="t-ink">Model</text>
        <path className="s3" strokeWidth="1.8" d="M0,18h16" /><text x="22" y="21.5" fontSize="9.5" className="t-ink">Baseline</text>
        <path className="thr" d="M0,36h16" /><text x="22" y="39.5" fontSize="9.5" className="t-ink">Chance</text>
      </g>}
    </svg>
  );
}

/* ---------- residue contact map ---------- */
export function ContactMap({ bare }: Bare) {
  const N = 56, c = 196 / N, X0 = bare ? 82 : 92, Y0 = 16;
  const cells: ReactNode[] = [];
  const on = (i: number, j: number) => {
    const d = Math.abs(i - j);
    if (d < 3) return true;
    if (i >= 4 && i <= 18 && j >= 4 && j <= 18 && (d === 3 || d === 4)) return true; // helix i,i+3/i+4
    if (i >= 24 && i <= 31 && j >= 40 && j <= 47 && i + j >= 69 && i + j <= 73) return true; // antiparallel strands
    if (i >= 40 && i <= 47 && j >= 24 && j <= 31 && i + j >= 69 && i + j <= 73) return true;
    if ((i === 10 && j === 50) || (i === 50 && j === 10) || (i === 12 && j === 52) || (i === 52 && j === 12)) return true;
    return false;
  };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (on(i, j)) cells.push(<rect key={`${i}-${j}`} x={f(X0 + j * c)} y={f(Y0 + i * c)} width={f(c)} height={f(c)} className={j > i ? 'f1' : 'fi'} fillOpacity={Math.abs(i - j) < 3 ? 0.35 : 1} />);
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      <rect x={X0} y={Y0} width="196" height="196" className="sr" />
      <g className="fade" style={{ ['--d' as string]: '0.2s' }}>{cells}</g>
      {!bare && <><text x={X0 + 98} y={Y0 + 214} fontSize="9.5" textAnchor="middle">Residue j</text><text x={X0 - 10} y={Y0 + 98} fontSize="9.5" textAnchor="middle" transform={`rotate(-90 ${X0 - 10} ${Y0 + 98})`}>Residue i</text>
        <g transform={`translate(${X0 + 210} ${Y0 + 8})`}><rect width="9" height="9" className="f1" /><text x="14" y="8" fontSize="9" className="t-ink">Predicted</text><rect y="17" width="9" height="9" className="fi" /><text x="14" y="25" fontSize="9" className="t-ink">Observed</text></g></>}
    </svg>
  );
}

/* ---------- expression heatmap ---------- */
export function Heatmap({ bare }: Bare) {
  const r = rng(53);
  const G = 24, S = 8, X0 = bare ? 50 : 60, Y0 = 26, cw = 22, ch = 7.6;
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      {Array.from({ length: S }, (_, j) => <rect key={'g' + j} x={X0 + j * cw} y={Y0 - 10} width={cw - 1} height="5" className={j < 4 ? 'f5' : 'f2'} />)}
      {Array.from({ length: G }, (_, i) => Array.from({ length: S }, (_, j) => {
        const up = i < G / 2, t = j >= 4, z = clamp((up === t ? 1 : -1) * (0.9 + r() * 0.9) + gauss(r) * 0.3, -2.4, 2.4);
        return <rect key={`${i}-${j}`} x={X0 + j * cw} y={f(Y0 + i * ch)} width={cw - 1} height={f(ch - 1)} className={z > 0 ? 'f2' : 'f1'} fillOpacity={f(Math.min(1, Math.abs(z) / 2.2))} />;
      }))}
      {!bare && <><text x={X0 + 2 * cw} y={Y0 - 14} fontSize="9" textAnchor="middle">Control</text><text x={X0 + 6 * cw} y={Y0 - 14} fontSize="9" textAnchor="middle">Treated</text>
        <text x={X0 - 8} y={Y0 + (G / 4) * ch} fontSize="9" textAnchor="end">Up</text><text x={X0 - 8} y={Y0 + (G * 3 / 4) * ch} fontSize="9" textAnchor="end">Down</text>
        <g transform={`translate(${X0 + S * cw + 22} ${Y0})`}><text x="0" y="0" fontSize="9" className="t-ink">z-score</text>{[2, 1, 0, -1, -2].map((z, k) => <g key={z} transform={`translate(0 ${10 + k * 14})`}><rect width="12" height="10" className={z > 0 ? 'f2' : z < 0 ? 'f1' : 'fp3'} fillOpacity={z ? Math.abs(z) / 2 : 1} /><text x="18" y="8.5" fontSize="9">{z > 0 ? `+${z}` : z}</text></g>)}</g></>}
    </svg>
  );
}

/* ---------- GC content along a sequence ---------- */
export function GcProfile({ bare }: Bare) {
  const r = rng(61);
  const L = 1200, win = 60, step = 12;
  let seq = '';
  for (let i = 0; i < L; i++) { const gcRich = i > 420 && i < 760; seq += r() < (gcRich ? 0.66 : 0.4) ? (r() < 0.5 ? 'G' : 'C') : r() < 0.5 ? 'A' : 'T'; }
  const pts: [number, number][] = [];
  for (let s = 0; s + win <= L; s += step) { let g = 0; for (let k = s; k < s + win; k++) if (seq[k] === 'G' || seq[k] === 'C') g++; pts.push([s + win / 2, g / win]); }
  const mean = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const X0 = 40, X1 = 348, Y0 = 14, Y1 = 196;
  const sx = (v: number) => X0 + (v / L) * (X1 - X0), sy = (v: number) => Y1 - ((v - 0.2) / 0.6) * (Y1 - Y0);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(sx(x))},${f(sy(clamp(y, 0.2, 0.8)))}`).join('');
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      <Axes x0={X0} x1={X1} y0={Y0} y1={Y1} bare={bare} xl="Position (bp)" yl="GC fraction" xt={[0, 400, 800, 1200].map((v) => ({ v, x: sx(v), t: String(v) }))} yt={[0.2, 0.5, 0.8].map((v) => ({ v, y: sy(v), t: v.toFixed(1) }))} />
      <rect x={f(sx(420))} y={Y0} width={f(sx(760) - sx(420))} height={Y1 - Y0} className="fp2" />
      <path className="thr" d={`M${X0},${f(sy(mean))}H${X1}`} />
      <path className="s1 draw" strokeWidth="1.6" d={d} style={{ ['--len' as string]: 900 }} />
      {!bare && <text x={f((sx(420) + sx(760)) / 2)} y={Y0 + 12} fontSize="9" textAnchor="middle" className="t-ink">GC-rich region</text>}
    </svg>
  );
}

/* ---------- group comparison (box + strip plot) ---------- */
export function Groups({ bare }: Bare) {
  const r = rng(71);
  const groups = [{ n: 'Control', m: 4.2 }, { n: 'Dose 1', m: 5.1 }, { n: 'Dose 2', m: 6.4 }];
  const X0 = 40, X1 = 348, Y0 = 14, Y1 = 196, sy = (v: number) => Y1 - ((v - 2) / 7) * (Y1 - Y0);
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      <Axes x0={X0} x1={X1} y0={Y0} y1={Y1} bare={bare} yl="Expression (log₂)" yt={[2, 4, 6, 8].map((v) => ({ v, y: sy(v), t: String(v) }))} />
      {groups.map((g, k) => {
        const vals = Array.from({ length: 14 }, () => clamp(g.m + gauss(r) * 0.75, 2.2, 8.8)).sort((a, b) => a - b);
        const q = (p: number) => vals[Math.round(p * (vals.length - 1))];
        const cx = X0 + 58 + k * 100;
        return <g key={g.n}>
          <path className="si" strokeWidth="1" d={`M${cx},${f(sy(q(0)))}V${f(sy(q(0.25)))}M${cx},${f(sy(q(0.75)))}V${f(sy(q(1)))}M${cx - 8},${f(sy(q(0)))}h16M${cx - 8},${f(sy(q(1)))}h16`} />
          <rect x={cx - 22} y={f(sy(q(0.75)))} width="44" height={f(sy(q(0.25)) - sy(q(0.75)))} className="fp" stroke="var(--ink)" strokeWidth="1" />
          <path className="si" strokeWidth="2" d={`M${cx - 22},${f(sy(q(0.5)))}h44`} />
          {vals.map((v, i) => <circle key={i} cx={f(cx + 30 + (r() - 0.5) * 18)} cy={f(sy(v))} r="2.3" className={`${k === 0 ? 'f3' : k === 1 ? 'f6' : 'f1'} pop`} style={{ ['--d' as string]: `${0.3 + k * 0.15 + i * 0.02}s` }} />)}
          {!bare && <text x={cx + 6} y={Y1 + 16} fontSize="9.5" textAnchor="middle" className="t-ink">{g.n}</text>}
        </g>;
      })}
    </svg>
  );
}

/* ---------- workflow DAG (nf-core style process names) ---------- */
export function Workflow({ bare }: Bare) {
  const nodes = [
    { id: 'in', t: 'samplesheet.csv', x: 14, y: 20, w: 112 }, { id: 'qc', t: 'FASTQC', x: 14, y: 78, w: 70 }, { id: 'tr', t: 'TRIM', x: 108, y: 78, w: 60 },
    { id: 'al', t: 'STAR_ALIGN', x: 190, y: 78, w: 92 }, { id: 'qu', t: 'SALMON', x: 190, y: 136, w: 72 }, { id: 'de', t: 'DESEQ2', x: 100, y: 194, w: 70 },
    { id: 'mq', t: 'MULTIQC', x: 284, y: 136, w: 66 }, { id: 'rp', t: 'report.html', x: 228, y: 194, w: 100, end: true },
  ];
  const by = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges: [string, string][] = [['in', 'qc'], ['in', 'tr'], ['tr', 'al'], ['al', 'qu'], ['qu', 'de'], ['qc', 'mq'], ['al', 'mq'], ['de', 'rp'], ['mq', 'rp']];
  const H = 24;
  const pt = (a: typeof nodes[number], b: typeof nodes[number]) => { const ax = a.x + a.w / 2, ay = a.y + H, bx = b.x + b.w / 2, by2 = b.y; if (Math.abs(a.y - b.y) < 2) return `M${a.x + a.w},${a.y + H / 2}H${b.x}`; const my = (ay + by2) / 2; return `M${f(ax)},${ay}V${f(my)}H${f(bx)}V${by2}`; };
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      {edges.map(([a, b], i) => <path key={i} d={pt(by[a], by[b])} className="s5 draw" strokeWidth="1.1" style={{ ['--d' as string]: `${0.2 + i * 0.07}s`, ['--len' as string]: 260 }} />)}
      {nodes.map((n, i) => (
        <g key={n.id} className="pop" style={{ ['--d' as string]: `${0.1 + i * 0.07}s` }}>
          <rect x={n.x} y={n.y} width={n.w} height={H} rx="2" className={n.end ? 'fi' : 'fp'} stroke={n.end ? 'none' : 'var(--rule-2)'} strokeWidth="1" />
          <rect x={n.x + 7} y={n.y + 9.5} width="5" height="5" rx="1" className={n.end ? 'f2' : n.id === 'in' ? 'f3' : 'f1'} />
          {!bare && <text x={n.x + 17} y={n.y + 15.5} fontSize="9.5" className={n.end ? 't-paper' : 't-ink'}>{n.t}</text>}
        </g>
      ))}
    </svg>
  );
}

/* ---------- pairwise alignment, computed with the same kernel as Sequence Studio ---------- */
export function AlignmentPanel() {
  const a = 'ATGGCGTACGTTAGCATGCCTAA', b = 'ATGGCGAACGTTAGCCATGCTAA';
  const r = align(a, b, { mode: 'global', kind: 'dna' });
  return (
    <div className="stack-sm">
      <pre className="aln" tabIndex={0} aria-label="Global alignment of two DNA sequences"><span className="pos">Query  1 </span>{r.a}{'\n'}<span className="pos">         </span><span className="m">{r.mid}</span>{'\n'}<span className="pos">Sbjct  1 </span>{r.b}</pre>
      <div className="metrics" style={{ borderBottom: 0 }}>
        <div className="metric"><small>Score</small><b className="sm">{r.score}</b></div>
        <div className="metric"><small>Identity</small><b className="sm">{(r.identity * 100).toFixed(0)}<em>%</em></b></div>
        <div className="metric"><small>Gaps</small><b className="sm">{r.gaps}</b></div>
      </div>
    </div>
  );
}

/* ---------- wet-lab figures: gel, qPCR, ELISA plate, growth curve, chromatogram ---------- */
// log10 of the band sizes used below, tabulated so no transcendental function is evaluated.
const LOG10: Record<number, number> = { 10000: 4, 8000: 3.9031, 6000: 3.7782, 5000: 3.699, 4000: 3.6021, 3000: 3.4771, 2000: 3.301, 1500: 3.1761, 1000: 3, 750: 2.8751, 500: 2.699, 250: 2.3979, 60: 1.7782 };

/** Agarose gel: 1 kb ladder, six PCR products and a no-template control, imaged as on a blue-light transilluminator. */
export function Gel({ bare }: Bare) {
  const X0 = 52, X1 = 348, Y0 = 14, Y1 = 204;
  const lanes = ['L', '1', '2', '3', '4', '5', '6', 'NTC'];
  const lw = (X1 - X0) / lanes.length, bw = lw * 0.66;
  const y = (bp: number) => Y0 + 22 + ((4 - LOG10[bp]) / (4 - 1.7782)) * (Y1 - Y0 - 34);
  const ladder = [10000, 8000, 6000, 5000, 4000, 3000, 2000, 1500, 1000, 750, 500, 250];
  const lanesBands: [number, number][][] = [
    ladder.map((bp) => [bp, bp === 3000 || bp === 1000 ? 1 : 0.62]),
    [[750, 0.95]], [[750, 0.82]], [[750, 0.9]], [[750, 0.6]], [[750, 0.86]],
    [[1500, 0.28], [750, 0.38], [60, 0.5]],
    [[60, 0.22]],
  ];
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} rx="5" fill="#0c1430" stroke="var(--rule-2)" />
      {lanes.map((_, i) => <rect key={'w' + i} x={f(X0 + i * lw + (lw - bw) / 2)} y={Y0 + 8} width={f(bw)} height="6" rx="1" fill="#050a1c" stroke="rgba(255,255,255,0.14)" strokeWidth="0.6" />)}
      {lanesBands.map((bands, i) => bands.map(([bp, op], j) => {
        const cx = X0 + i * lw + lw / 2, by = y(bp), w = bp === 60 ? bw * 0.86 : bw;
        return <g key={`${i}-${j}`} className="fade" style={{ ['--d' as string]: `${0.2 + i * 0.08}s` }}>
          <rect x={f(cx - w / 2)} y={f(by - 4)} width={f(w)} height="8" rx="3" fill="#6fd6b4" fillOpacity={f(op * 0.22)} />
          <rect x={f(cx - w / 2)} y={f(by - 1.7)} width={f(w)} height={bp === 60 ? 4.6 : 3.4} rx="1.4" fill="#e9fff6" fillOpacity={f(op)} />
        </g>;
      }))}
      {!bare && <>
        {[[10000, '10 kb'], [3000, '3 kb'], [1000, '1 kb'], [500, '500'], [250, '250 bp']].map(([bp, t]) => <text key={t} x={X0 - 6} y={f(y(bp as number) + 3)} fontSize="9" textAnchor="end">{t}</text>)}
        {lanes.map((t, i) => <text key={t} x={f(X0 + i * lw + lw / 2)} y={Y1 + 15} fontSize="9.5" textAnchor="middle" className="t-ink">{t}</text>)}
        <text x={f(X0 + 3.5 * lw)} y={f(y(750) - 9)} fontSize="8.5" textAnchor="middle" fill="#bfeedd">750-bp product</text>
      </>}
    </svg>
  );
}

/** qPCR amplification curves of a ten-fold dilution series (logistic growth per cycle, arithmetic only). */
export function Qpcr({ bare }: Bare) {
  const X0 = 40, X1 = 348, Y0 = 14, Y1 = 196, N = 40, E = 0.95, TH = 0.2, BASE = 0.02;
  const sx = (c: number) => X0 + (c / N) * (X1 - X0), sy = (v: number) => Y1 - (v / 1.1) * (Y1 - Y0);
  const series: { pts: number[]; ct: number }[] = [];
  let start = 1e-6;
  for (let k = 0; k < 5; k++) {
    const pts: number[] = [];
    let F = start, ct = 0;
    for (let c = 0; c <= N; c++) {
      const v = BASE + F;
      if (!ct && c && v >= TH) { const prev = pts[c - 1]; ct = c - 1 + (TH - prev) / (v - prev); }
      pts.push(v); F = F + E * F * (1 - F);
    }
    series.push({ pts, ct }); start /= 10;
  }
  const r = rng(29);
  const ntc = Array.from({ length: N + 1 }, () => BASE + (r() - 0.5) * 0.012);
  const dCt = (series[4].ct - series[0].ct) / 4;
  const path = (p: number[]) => p.map((v, c) => `${c ? 'L' : 'M'}${f(sx(c))},${f(sy(v))}`).join('');
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      <Axes x0={X0} x1={X1} y0={Y0} y1={Y1} bare={bare} xl="Cycle" yl="ΔRn (normalised)" xt={[0, 10, 20, 30, 40].map((v) => ({ v, x: sx(v), t: String(v) }))} yt={[0, 0.5, 1].map((v) => ({ v, y: sy(v), t: v.toFixed(1) }))} />
      <path className="thr" d={`M${X0},${f(sy(TH))}H${X1}`} />
      <path className="s3" strokeWidth="1.2" d={path(ntc)} />
      {series.map((s, k) => <path key={k} className={k % 2 ? 's2 draw' : 's1 draw'} strokeWidth="1.7" d={path(s.pts)} style={{ ['--d' as string]: `${0.2 + k * 0.12}s`, ['--len' as string]: 520 }} />)}
      {series.map((s, k) => <circle key={'c' + k} cx={f(sx(s.ct))} cy={f(sy(TH))} r="2.8" className="fi pop" style={{ ['--d' as string]: `${0.9 + k * 0.1}s` }} />)}
      {!bare && <>
        <text x={X1 - 2} y={f(sy(TH) - 5)} fontSize="9" textAnchor="end">Threshold</text>
        <text x={f(sx(series[0].ct) - 4)} y={f(sy(TH) + 14)} fontSize="9" textAnchor="end" className="t-ink">Ct {series[0].ct.toFixed(1)}</text>
        <text x={f(sx(series[4].ct) + 5)} y={f(sy(TH) + 14)} fontSize="9" className="t-ink">Ct {series[4].ct.toFixed(1)}</text>
        <text x={X0 + 8} y={Y0 + 12} fontSize="9">10-fold dilutions · ΔCt ≈ {dCt.toFixed(2)}</text><text x={X0 + 8} y={Y0 + 25} fontSize="9">No-template control: flat</text>
      </>}
    </svg>
  );
}

/** 96-well ELISA plate after the stop solution: standards in duplicate and samples in duplicate. */
export function Plate({ bare }: Bare) {
  const r = rng(83);
  const X0 = 46, Y0 = 34, dx = 25.2, dy = 21.6, R = 8.4;
  const conc = (i: number) => (i === 7 ? 0 : 1 / (1 << i));
  const od = (c: number) => 0.06 + (2.6 * c) / (c + 0.22);
  const samples = Array.from({ length: 5 * 8 }, () => 0.2 + r() * 1.8);
  const val = (row: number, col: number) => {
    if (col < 2) return od(conc(row)) * (1 + (col ? 0.03 : -0.02));
    const s = samples[row * 5 + ((col - 2) >> 1)];
    return s + (col % 2 ? gauss(r) * 0.04 : 0);
  };
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      <rect x={X0 - 22} y={Y0 - 26} width={12 * dx + 30} height={8 * dy + 34} rx="12" className="fp2" stroke="var(--rule-2)" />
      {Array.from({ length: 8 }, (_, row) => Array.from({ length: 12 }, (_, col) => {
        const v = val(row, col);
        return <circle key={`${row}-${col}`} cx={f(X0 + col * dx)} cy={f(Y0 + row * dy)} r={R} fill="#e3a91c" fillOpacity={f(clamp(v / 2.6, 0.05, 1))} stroke="var(--rule-2)" strokeWidth="0.8" className="pop" style={{ ['--d' as string]: `${0.1 + col * 0.04 + row * 0.02}s` }} />;
      }))}
      {!bare && <>
        {Array.from({ length: 12 }, (_, col) => <text key={'c' + col} x={f(X0 + col * dx)} y={Y0 - 14} fontSize="8.5" textAnchor="middle">{col + 1}</text>)}
        {'ABCDEFGH'.split('').map((t, row) => <text key={t} x={X0 - 15} y={f(Y0 + row * dy + 3)} fontSize="8.5" textAnchor="middle">{t}</text>)}
        <path className="sr" d={`M${X0 - R},${Y0 + 7 * dy + 18}H${f(X0 + dx + R)}M${f(X0 + 2 * dx - R)},${Y0 + 7 * dy + 18}H${f(X0 + 11 * dx + R)}`} strokeWidth="1.2" />
        <text x={f(X0 + dx / 2)} y={Y0 + 7 * dy + 31} fontSize="9" textAnchor="middle" className="t-ink">Standards</text>
        <text x={f(X0 + 6.5 * dx)} y={Y0 + 7 * dy + 31} fontSize="9" textAnchor="middle" className="t-ink">Samples in duplicate · A450</text>
      </>}
    </svg>
  );
}

/** Bacterial growth curves (OD600) in two media: lag, exponential and stationary phases (Euler-integrated logistic). */
export function Growth({ bare }: Bare) {
  const r = rng(97);
  const X0 = 40, X1 = 348, Y0 = 14, Y1 = 196, T = 24, dt = 0.25;
  const sx = (t: number) => X0 + (t / T) * (X1 - X0), sy = (v: number) => Y1 - (v / 2) * (Y1 - Y0);
  const media = [{ K: 1.8, mu: 0.95, lag: 2.5, c: 1 }, { K: 1.15, mu: 0.55, lag: 4, c: 2 }];
  const curves = media.map((m) => {
    const pts: [number, number][] = [];
    let N = 0.02;
    for (let t = 0; t <= T + 1e-9; t += dt) {
      pts.push([t, N]);
      const ramp = t < m.lag ? (t / m.lag) * (t / m.lag) : 1;
      N += m.mu * ramp * N * (1 - N / m.K) * dt;
    }
    return { m, pts, obs: pts.filter((_, i) => i % 6 === 0).map(([t, v]) => [t, clamp(v * (1 + gauss(r) * 0.035), 0, 2)] as [number, number]) };
  });
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      <Axes x0={X0} x1={X1} y0={Y0} y1={Y1} bare={bare} xl="Time (h)" yl="OD₆₀₀" xt={[0, 6, 12, 18, 24].map((v) => ({ v, x: sx(v), t: String(v) }))} yt={[0, 0.5, 1, 1.5, 2].map((v) => ({ v, y: sy(v), t: v.toFixed(1) }))} />
      <rect x={X0 + 1} y={Y0} width={f(sx(2.5) - X0)} height={Y1 - Y0} className="fp2" />
      {curves.map(({ m, pts, obs }) => <g key={m.c}>
        <path className={`s${m.c} draw`} strokeWidth="1.7" d={pts.map(([t, v], i) => `${i ? 'L' : 'M'}${f(sx(t))},${f(sy(v))}`).join('')} style={{ ['--d' as string]: `${0.2 + m.c * 0.15}s`, ['--len' as string]: 520 }} />
        {obs.map(([t, v], i) => <circle key={i} cx={f(sx(t))} cy={f(sy(v))} r="2.4" className={`f${m.c} pop`} style={{ ['--d' as string]: `${0.5 + i * 0.03}s` }} />)}
      </g>)}
      {!bare && <>
        <text x={f(sx(1.25))} y={Y0 + 12} fontSize="9" textAnchor="middle" className="t-ink">Lag</text>
        <text x={f(sx(6.2))} y={Y0 + 12} fontSize="9" textAnchor="middle" className="t-ink">Exponential</text>
        <text x={f(sx(17))} y={Y0 + 12} fontSize="9" textAnchor="middle" className="t-ink">Stationary</text>
        <g transform={`translate(${X1 - 112} ${Y1 - 34})`}><circle cx="4" cy="0" r="3" className="f1" /><text x="12" y="3" fontSize="9">Rich medium</text><circle cx="4" cy="14" r="3" className="f2" /><text x="12" y="17" fontSize="9">Minimal medium</text></g>
      </>}
    </svg>
  );
}

/** Reversed-phase HPLC chromatogram: solvent front and five resolved peaks labelled by retention time. */
export function Chromatogram({ bare }: Bare) {
  const X0 = 40, X1 = 348, Y0 = 14, Y1 = 196, T = 15;
  const peaks = [{ t: 1.1, h: 0.16, w: 0.1, front: true }, { t: 3.4, h: 0.62, w: 0.09 }, { t: 5.2, h: 0.36, w: 0.11 }, { t: 7.8, h: 0.95, w: 0.13 }, { t: 9.3, h: 0.24, w: 0.12 }, { t: 11.7, h: 0.5, w: 0.16 }];
  const sig = (t: number) => peaks.reduce((s, p) => { const q = (t - p.t) / p.w; const d = 1 + q * q; return s + p.h / (d * d); }, 0.03 + 0.003 * t);
  const sx = (t: number) => X0 + (t / T) * (X1 - X0), sy = (v: number) => Y1 - (v / 1.05) * (Y1 - Y0);
  const pts = Array.from({ length: 301 }, (_, i) => { const t = (i / 300) * T; return [t, sig(t)] as [number, number]; });
  const line = pts.map(([t, v], i) => `${i ? 'L' : 'M'}${f(sx(t))},${f(sy(v))}`).join('');
  return (
    <svg className="fx" viewBox="0 0 360 240" aria-hidden>
      <Axes x0={X0} x1={X1} y0={Y0} y1={Y1} bare={bare} xl="Retention time (min)" yl="Absorbance (mAU)" xt={[0, 5, 10, 15].map((v) => ({ v, x: sx(v), t: String(v) }))} yt={[0, 0.5, 1].map((v) => ({ v, y: sy(v), t: String(v * 1000) }))} />
      <path className="area1" d={`${line}L${X1},${Y1}L${X0},${Y1}Z`} />
      <path className="s1 draw" strokeWidth="1.5" d={line} style={{ ['--len' as string]: 1400 }} />
      {!bare && peaks.map((p) => <text key={p.t} x={f(sx(p.t))} y={f(sy(sig(p.t)) - 6)} fontSize="8.5" textAnchor="middle" className={p.front ? undefined : 't-ink'}>{p.front ? 'solvent' : p.t.toFixed(1)}</text>)}
    </svg>
  );
}

/** One figure per course and service topic. */
export type FigureKind = 'coverage' | 'pileup' | 'volcano' | 'umap' | 'tree' | 'interaction' | 'qsar' | 'composition' | 'roc' | 'contact' | 'heatmap' | 'gc' | 'groups' | 'workflow' | 'alignment' | 'gel' | 'qpcr' | 'plate' | 'growth' | 'chromatogram';
export const FIGURES: Record<FigureKind, { C: (p: Bare) => React.JSX.Element; caption: string }> = {
  coverage: { C: () => <CoverageTracks />, caption: 'Short-read coverage, read pileup and a five-exon gene model. Spliced reads cross introns; the vermilion column marks a heterozygous SNV.' },
  pileup: { C: Pileup, caption: 'Read pileup at a candidate variant: about half of the reads carry the alternate allele, consistent with a heterozygous call. One read carries a 2-bp deletion.' },
  volcano: { C: Volcano, caption: 'Volcano plot from a differential-expression test. Genes beyond |log₂FC| > 1 at 5% FDR are coloured: up-regulated in vermilion, down-regulated in blue.' },
  umap: { C: Umap, caption: 'Graph-based clusters of single cells shown in a UMAP embedding. Distances between clusters in UMAP space are not quantitative.' },
  tree: { C: Tree, caption: 'Maximum-likelihood phylogeny with bootstrap support at internal nodes. Support below about 70 is weak evidence for a clade.' },
  interaction: { C: Interaction, caption: '2D protein–ligand interaction diagram of a docked pose: hydrogen bonds (dashed, with donor–acceptor distances) and hydrophobic contacts (dotted).' },
  qsar: { C: Qsar, caption: 'QSAR model evaluated by cluster cross-validation: predicted against observed activity, with compounds outside the applicability domain flagged.' },
  composition: { C: Composition, caption: 'Relative abundance of the most common genera in eight samples from two groups. Composition data are relative, so they need compositional statistics.' },
  roc: { C: Roc, caption: 'ROC curves for a model and a simple baseline on held-out data. A model is only worth reporting if it beats the baseline under a leakage-free split.' },
  contact: { C: ContactMap, caption: 'Residue contact map: a helix appears as bands next to the diagonal and an antiparallel β-sheet as an anti-diagonal. Upper triangle predicted, lower triangle observed.' },
  heatmap: { C: Heatmap, caption: 'Expression heatmap of differentially expressed genes (row z-scores) across control and treated samples.' },
  gc: { C: GcProfile, caption: 'GC fraction in a 60-bp sliding window. The shaded interval is a GC-rich region; the dashed line is the sequence mean.' },
  groups: { C: Groups, caption: 'Expression in three groups shown as box plots with every observation, so the reader can see the spread as well as the summary.' },
  workflow: { C: Workflow, caption: 'A workflow as a directed acyclic graph, in nf-core process naming: every step is versioned, containerised and re-runnable.' },
  alignment: { C: () => <AlignmentPanel />, caption: 'Global alignment of two DNA sequences with affine gap penalties, computed in your browser by the same code as our Sequence Studio.' },
  gel: { C: Gel, caption: 'Agarose gel of PCR products: a 1 kb ladder (L), six samples with the expected 750-bp product and a no-template control (NTC). Lane 6 shows a weak product, a non-specific band and primer-dimer.' },
  qpcr: { C: Qpcr, caption: 'qPCR amplification curves for a ten-fold dilution series. Each dilution crosses the threshold about 3.5 cycles later, consistent with about 95% efficiency; the no-template control stays flat.' },
  plate: { C: Plate, caption: '96-well ELISA plate after the stop solution: a two-fold standard series in duplicate (columns 1–2, blank in row H) and samples in duplicate. Colour intensity tracks absorbance at 450 nm.' },
  growth: { C: Growth, caption: 'Bacterial growth curves (OD₆₀₀) in a rich and a minimal medium, showing lag, exponential and stationary phases. Growth rate is estimated from the exponential phase only.' },
  chromatogram: { C: Chromatogram, caption: 'Reversed-phase HPLC chromatogram (UV absorbance): the solvent front and five resolved peaks labelled by retention time. Peak area, not height, is used for quantification.' },
};
