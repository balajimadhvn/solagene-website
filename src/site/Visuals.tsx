// Animated visuals for the company pages. All motion is CSS (see science.css) and switches off under
// prefers-reduced-motion. Decorative, so hidden from assistive technology.
import type { Glyph } from './data/focus';

const STAGES = ['Target', 'Design', 'Simulate', 'Validate', 'Learn'];

/** The discovery loop: five stages on a ring, a pulse travelling around it and each stage lighting up in turn. */
export function DiscoveryLoop() {
  const R = 150, C = 200;
  const pts = STAGES.map((_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / STAGES.length; return [C + R * Math.cos(a), C + R * Math.sin(a)] as const; });
  return (
    <svg className="dloop" viewBox="0 0 400 400" role="img" aria-label="The Vivofold discovery loop: target, design, simulate, validate, learn" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="dl-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4f8bff" /><stop offset="0.55" stopColor="#8a7be6" /><stop offset="1" stopColor="#3fd0a8" /></linearGradient>
        <radialGradient id="dl-core" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#4f8bff" stopOpacity="0.35" /><stop offset="1" stopColor="#4f8bff" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx={C} cy={C} r={R + 40} fill="url(#dl-core)" className="dl-halo" />
      <circle cx={C} cy={C} r={R} fill="none" stroke="url(#dl-g)" strokeWidth="1.5" strokeDasharray="3 7" className="dl-ring" />
      <circle cx={C} cy={C} r={R - 46} fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />
      <g className="dl-orbit"><circle cx={C} cy={C - R} r="6" fill="#3fd0a8" /><circle cx={C} cy={C - R} r="14" fill="#3fd0a8" opacity="0.25" /></g>
      {pts.map(([x, y], i) => (
        <g key={STAGES[i]} className="dl-node" style={{ ['--d' as string]: `${i * 2}s` }}>
          <circle cx={x} cy={y} r="30" className="dl-node-bg" />
          <circle cx={x} cy={y} r="30" fill="none" stroke="url(#dl-g)" strokeWidth="1.5" />
          <text x={x} y={y + 4} textAnchor="middle" className="dl-label">{STAGES[i]}</text>
        </g>
      ))}
      <text x={C} y={C - 4} textAnchor="middle" className="dl-core-t">VIVOFOLD</text>
      <text x={C} y={C + 16} textAnchor="middle" className="dl-core-s">discovery loop</text>
    </svg>
  );
}

/** Small animated glyphs, one per focus area. */
export function PillarGlyph({ kind }: { kind: Glyph }) {
  const P = { viewBox: '0 0 64 64', 'aria-hidden': true, className: `pg pg--${kind}` } as const;
  if (kind === 'molecule') return (
    <svg {...P}><g stroke="currentColor" strokeWidth="1.6" fill="none"><path d="M32 8 52 20v24L32 56 12 44V20z" /><path d="M32 8v16m0 0L12 20m20 4 20-4m-20 4v32" opacity="0.5" /></g>
      {[[32, 8], [52, 20], [52, 44], [32, 56], [12, 44], [12, 20], [32, 24]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.6" className="pg-node" style={{ ['--d' as string]: `${i * 0.35}s` }} />)}</svg>
  );
  if (kind === 'design') return (
    <svg {...P}><g fill="none" strokeWidth="2.2" strokeLinecap="round"><path className="pg-strand" d="M6 12c13 0 13 40 26 40s13-40 26-40" stroke="#4f8bff" /><path className="pg-strand pg-strand--2" d="M6 52c13 0 13-40 26-40s13 40 26 40" stroke="#3fd0a8" /></g>
      {[14, 23, 32, 41, 50].map((x, i) => <line key={x} x1={x} y1="22" x2={x} y2="42" stroke="currentColor" strokeOpacity="0.25" className="pg-rung" style={{ ['--d' as string]: `${i * 0.25}s` }} />)}</svg>
  );
  if (kind === 'omics') return (
    <svg {...P}>{Array.from({ length: 25 }, (_, i) => <rect key={i} x={8 + (i % 5) * 11} y={8 + Math.floor(i / 5) * 11} width="9" height="9" rx="2" className="pg-cell" style={{ ['--d' as string]: `${((i * 7) % 25) * 0.12}s` }} />)}</svg>
  );
  if (kind === 'target') return (
    <svg {...P}><g fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="32" cy="32" r="8" className="pg-ring" /><circle cx="32" cy="32" r="16" className="pg-ring pg-ring--2" /><circle cx="32" cy="32" r="24" strokeOpacity="0.3" /><path d="M32 4v10M32 50v10M4 32h10M50 32h10" strokeOpacity="0.5" /></g><circle cx="32" cy="32" r="3.6" fill="#3fd0a8" /></svg>
  );
  if (kind === 'platform') return (
    <svg {...P}><g className="pg-layers" fill="none" strokeWidth="1.6"><path d="M32 8 56 20 32 32 8 20z" stroke="#4f8bff" className="pg-layer" /><path d="M8 30l24 12 24-12" stroke="#8a7be6" className="pg-layer pg-layer--2" /><path d="M8 40l24 12 24-12" stroke="#3fd0a8" className="pg-layer pg-layer--3" /></g></svg>
  );
  return (
    <svg {...P}><g fill="none" strokeWidth="1.8"><circle cx="24" cy="26" r="13" stroke="#4f8bff" className="pg-orb" /><circle cx="40" cy="26" r="13" stroke="#8a7be6" className="pg-orb pg-orb--2" /><circle cx="32" cy="40" r="13" stroke="#3fd0a8" className="pg-orb pg-orb--3" /></g></svg>
  );
}

const FUNNEL = [
  { n: '10⁶+', t: 'Ideas generated', d: 'Generative models explore chemical space against the target profile', w: 100 },
  { n: '10⁴', t: 'Fast filters', d: 'Docking, learned affinity and ADMET models remove weak ideas', w: 74 },
  { n: '10²', t: 'Physics ranking', d: 'Molecular dynamics and free-energy methods on the shortlist', w: 48 },
  { n: '10¹', t: 'Assay-ready', d: 'Synthesisable candidates with evidence for each choice', w: 26 },
];
/** Illustrative funnel: orders of magnitude only, not results. Bars grow when scrolled into view (CSS). */
export function Funnel() {
  return (
    <figure className="funnel">
      <ol>
        {FUNNEL.map((f, i) => (
          <li key={f.t} style={{ ['--i' as string]: i }}>
            <div className="funnel-bar" style={{ ['--w' as string]: `${f.w}%` }}><span className="funnel-n">{f.n}</span></div>
            <div className="funnel-t"><b>{f.t}</b><span>{f.d}</span></div>
          </li>
        ))}
      </ol>
      <figcaption className="small subtle">Illustrative orders of magnitude for a typical campaign. Real numbers depend on the target and the product profile.</figcaption>
    </figure>
  );
}
