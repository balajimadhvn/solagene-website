import { useEffect, useRef } from 'react';

/**
 * Signature hero visual: a strand of ~180 beads that slowly folds from an extended double helix into a compact,
 * protein-like fold and unfolds again. Rendered on a 2D canvas with a simple perspective
 * projection, depth shading and pointer-driven rotation: no WebGL and no dependencies.
 * Honours prefers-reduced-motion (renders one still frame) and pauses when off screen or in a background tab.
 */
type V3 = [number, number, number];
const N = 180;

function helix(i: number, strand: 0 | 1): V3 {
  const t = (i / N) * Math.PI * 6.2 + strand * Math.PI;
  const y = (i / N - 0.5) * 2.5;
  return [Math.cos(t) * 0.42, y, Math.sin(t) * 0.42];
}
/** A compact, smooth, knot-like path standing in for a folded chain (deterministic). */
function fold(i: number): V3 {
  const u = (i / N) * Math.PI * 2;
  const r = 0.62 + 0.22 * Math.cos(3 * u);
  return [r * Math.cos(2 * u), 0.55 * Math.sin(3 * u) + 0.12 * Math.sin(7 * u), r * Math.sin(2 * u)];
}
const ease = (x: number) => x * x * (3 - 2 * x);

export default function FoldField({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const c2 = cv.getContext('2d'); if (!c2) return;
    const ctx: CanvasRenderingContext2D = c2;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, t0 = performance.now();
    let rx = -0.25, ry = 0, tx = -0.25, ty = 0;
    const style = getComputedStyle(cv);
    const col = { a: style.getPropertyValue('--ff-a').trim() || '#8ea6ff', b: style.getPropertyValue('--ff-b').trim() || '#ffffff', c: style.getPropertyValue('--ff-c').trim() || '#f59e0b', line: style.getPropertyValue('--ff-line').trim() || 'rgba(170,185,255,0.28)' };

    const resize = () => { const r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1); w = r.width; h = r.height; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (reduced && w > 0) frame(performance.now()); };
    const ro = new ResizeObserver(resize); ro.observe(cv); resize();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !reduced) loop(); }, { threshold: 0 }); io.observe(cv);
    const move = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); tx = ((e.clientY - r.top) / r.height - 0.5) * 0.7 - 0.2; ty = ((e.clientX - r.left) / r.width - 0.5) * 1.2; };
    window.addEventListener('pointermove', move, { passive: true });
    const vis = () => { if (document.hidden) cancelAnimationFrame(raf); else if (visible && !reduced) loop(); };
    document.addEventListener('visibilitychange', vis);

    function project(p: V3, a: number, b: number): [number, number, number] {
      const [x0, y0, z0] = p;
      const x1 = x0 * Math.cos(b) + z0 * Math.sin(b), z1 = -x0 * Math.sin(b) + z0 * Math.cos(b);
      const y2 = y0 * Math.cos(a) - z1 * Math.sin(a), z2 = y0 * Math.sin(a) + z1 * Math.cos(a);
      const s = Math.min(w, h) * 0.36, persp = 2.6 / (2.6 + z2);
      return [w / 2 + x1 * s * persp, h / 2 + y2 * s * persp, z2];
    }

    function frame(now: number) {
      const t = (now - t0) / 1000;
      rx += (tx - rx) * 0.04; ry += (ty - ry) * 0.04;
      const spin = reduced ? 0.6 : t * 0.18;
      const cycle = reduced ? 0.35 : (Math.sin(t * 0.32) + 1) / 2; // 0 = helix, 1 = folded
      const k = ease(cycle);
      ctx.clearRect(0, 0, w, h);
      const pts: { x: number; y: number; z: number; s: 0 | 1; i: number }[] = [];
      for (const s of [0, 1] as const) for (let i = 0; i < N; i++) {
        const a = helix(i, s), f = fold(i);
        const off: V3 = s ? [0.05, 0.03, -0.05] : [0, 0, 0];
        const m: V3 = [a[0] + (f[0] + off[0] - a[0]) * k, a[1] + (f[1] + off[1] - a[1]) * k, a[2] + (f[2] + off[2] - a[2]) * k];
        const [x, y, z] = project(m, rx, ry + spin);
        pts.push({ x, y, z, s, i });
      }
      // backbone lines
      for (const s of [0, 1] as const) {
        ctx.beginPath();
        pts.filter((p) => p.s === s).forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.strokeStyle = col.line; ctx.lineWidth = 1.1; ctx.stroke();
      }
      // base-pair rungs fade out as the strand folds
      if (k < 0.95) {
        ctx.globalAlpha = (1 - k) * 0.55;
        for (let i = 0; i < N; i += 3) { const p = pts[i], q = pts[N + i]; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.strokeStyle = col.line; ctx.lineWidth = 1; ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      // beads, far to near
      pts.sort((p, q) => q.z - p.z);
      for (const p of pts) {
        const depth = Math.max(0, Math.min(1, (1.2 - p.z) / 2.4));
        const r = (p.s ? 1.6 : 2.1) * (0.55 + depth * 0.9);
        ctx.globalAlpha = 0.25 + depth * 0.75;
        ctx.fillStyle = p.i % 23 === 7 && p.s === 0 ? col.c : p.s ? col.a : col.b;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function loop() { cancelAnimationFrame(raf); const step = (now: number) => { frame(now); if (visible && !document.hidden) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); }
    if (reduced) frame(performance.now()); else loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', move); document.removeEventListener('visibilitychange', vis); };
  }, []);
  return <canvas ref={ref} className={`foldfield ${className}`} aria-hidden="true" />;
}
