"use client";
import { useEffect, useState } from "react";

export const I = { lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5z", back: "M20 6H9l-6 6 6 6h11zM15 10l-4 4M11 10l4 4", edit: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3", heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.500-7 10-7 10z", grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z", check: "M5 12l4 4 10-10", wallet: "M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l2-3h12M17 14h.01", pulse: "M3 12h4l3-8 4 16 3-8h4", cam: "M4 8h4l2-3h4l2 3h4v11H4zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", x: "M6 6l12 12M18 6L6 18", plus: "M12 5v14M5 12h14", next: "M9 6l6 6-6 6", cal: "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4", spark: "M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" };
export const Ic = ({ d, s = 18 }) => <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

// Glass card with a cursor-following spotlight and staggered slide-up entrance
export function Card({ className = "", i = 0, style, children, ...r }) {
  const mv = (e) => { const b = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", e.clientX - b.left + "px"); e.currentTarget.style.setProperty("--my", e.clientY - b.top + "px"); };
  return <div className={"card " + className} style={{ "--i": i, ...style }} onMouseMove={mv} {...r}>{children}</div>;
}

export function CountUp({ value, dec = 0, prefix = "" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(value); return; }
    let raf; const t0 = performance.now();
    const step = (t) => { const p = Math.min((t - t0) / 900, 1); setV(value * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{prefix}{v.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })}</>;
}

const smooth = (p) => p.reduce((d, c, i) => { if (!i) return `M${c[0]} ${c[1]}`; const a = p[i - 1], m = (a[0] + c[0]) / 2; return d + ` C${m} ${a[1]} ${m} ${c[1]} ${c[0]} ${c[1]}`; }, "");

export function Spark({ vals, w = 90, h = 30, color = "var(--ac2)" }) {
  const mx = Math.max(...vals, 1), p = vals.map((v, i) => [2 + i * (w - 4) / Math.max(vals.length - 1, 1), h - 3 - (h - 6) * v / mx]);
  return <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}><path className="line" pathLength="1" d={smooth(p)} fill="none" style={{ stroke: color }} strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

export function LineChart({ vals, labels, color = "var(--ac2)", id = "c", unit = "", fit = false }) {
  const W = 400, H = 170, n = Math.max(vals.length - 1, 1), mn = Math.min(...vals), mxv = Math.max(...vals), pad = (mxv - mn || 1) * .3, lo = fit ? mn - pad : 0, mx = fit ? mxv + pad : Math.max(...vals, 1) * 1.2;
  const X = (i) => 32 + i * (W - 46) / n, Y = (v) => 12 + (H - 38) * (1 - (v - lo) / (mx - lo));
  const p = vals.map((v, i) => [X(i), Y(v)]), l = p[p.length - 1], d = smooth(p);
  const lab = [0, Math.round(n / 3), Math.round(2 * n / 3), n];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="lc" role="img" aria-label="Trend chart">
      <defs><linearGradient id={"g" + id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor: color }} stopOpacity=".3" /><stop offset="1" style={{ stopColor: color }} stopOpacity="0" /></linearGradient></defs>
      {[0, 1, 2, 3].map((j) => { const y = 12 + (H - 38) * j / 3; return <g key={j}><line x1="30" x2={W - 8} y1={y} y2={y} stroke="#ffffff14" /><text x="0" y={y + 3} fill="#b9aca4" fontSize="9">{fit ? (lo + (mx - lo) * (1 - j / 3)).toFixed(1) : Math.round(mx * (1 - j / 3))}</text></g>; })}
      <path className="area" d={`${d} L${l[0]} ${H - 26} L${p[0][0]} ${H - 26}Z`} fill={`url(#g${id})`} />
      <path className="line" pathLength="1" d={d} fill="none" style={{ stroke: color }} strokeWidth="2.4" strokeLinecap="round" />
      {p.map((q, i) => <circle key={i} className="pt" cx={q[0]} cy={q[1]} r="3.5" fill="#1b1614" style={{ stroke: color }} strokeWidth="2"><title>{`${labels[i]}: ${vals[i]}${unit}`}</title></circle>)}
      <rect x={l[0] - 17} y={Math.max(l[1] - 30, 0)} width="34" height="17" rx="8.5" fill="#15110f" />
      <text x={l[0]} y={Math.max(l[1] - 18, 12)} fill="#fff" fontSize="9.5" textAnchor="middle">{vals[vals.length - 1]}</text>
      {lab.map((i) => <text key={i} x={X(i)} y={H - 6} fill="#b9aca4" fontSize="9" textAnchor="middle">{labels[i]}</text>)}
    </svg>
  );
}

export { vt } from "../lib/vt";
