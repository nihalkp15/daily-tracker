"use client";
// Stylised front/back body figure. Pass levels = { muscleId: 0..1 } to light muscles up.
import { useState } from "react";
import { MUSCLES } from "../lib/exercises";

const el = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
const rc = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
const MIR = "matrix(-1 0 0 1 200 0)"; // L shapes are drawn on the left and mirrored to the right
const BASE = [el(100, 26, 16, 19), rc(93, 42, 14, 16, 3), "M72 68L128 68L125 172L75 172Z", el(62, 82, 16, 19), el(50, 114, 11, 24), el(43, 152, 9, 24), el(40, 182, 6, 10), "M76 166L124 166L120 192L80 192Z", el(86, 216, 15, 48), el(85, 318, 10, 28), el(83, 352, 8, 6)];
const FRONT = [
  { m: "traps", L: ["M94 57L72 66L84 72L96 62Z"] }, { m: "chest", L: ["M97 74C86 70 72 74 70 88C70 102 84 110 97 106Z"] }, { m: "shoulders", L: [el(62, 80, 14, 17)] },
  { m: "biceps", L: [el(50, 112, 9, 20)] }, { m: "forearms", L: [el(43, 152, 8, 20)] }, { m: "obliques", L: ["M86 112L77 118Q72 140 78 162L87 160Z"] },
  { m: "abs", C: [110, 126, 142].flatMap((y) => [rc(89, y, 10, 13, 3), rc(101, y, 10, 13, 3)]) },
  { m: "quads", L: [el(86, 214, 13, 44)] }, { m: "calves", L: [el(85, 318, 9, 26)] },
];
const BACK = [
  { m: "traps", C: ["M100 56L84 66L78 84L100 100L122 84L116 66Z"] }, { m: "upperback", C: [rc(90, 100, 20, 38, 6)] }, { m: "lats", L: ["M78 88L89 100L89 138L84 148Q72 122 78 88Z"] },
  { m: "shoulders", L: [el(62, 80, 14, 17)] }, { m: "triceps", L: [el(50, 112, 9, 20)] }, { m: "forearms", L: [el(43, 152, 8, 20)] },
  { m: "lowerback", C: [rc(88, 140, 24, 24, 6)] }, { m: "glutes", L: [el(90, 180, 12, 14)] }, { m: "hamstrings", L: [el(86, 232, 13, 38)] }, { m: "calves", L: [el(85, 318, 9, 26)] },
];

export default function BodyMapSimple({ levels = {}, sel, onPick, compact }) {
  const [side, setSide] = useState("front"), zones = side === "front" ? FRONT : BACK;
  const hidden = Object.keys(levels).filter((m) => levels[m] > 0 && !zones.some((z) => z.m === m));
  return (
    <div className={"bm" + (compact ? " cp" : "")}>
      <svg viewBox="0 0 200 366" role="img" aria-label={"Muscle map, " + side + " view"}>
        <g className="bb">{BASE.flatMap((d, i) => [<path key={"a" + i} d={d} />, <path key={"b" + i} d={d} transform={MIR} />])}</g>
        {zones.map((z) => {
          const lv = levels[z.m] || 0;
          return (
            <g key={z.m} className={"mz" + (lv > .45 ? " lit" : "") + (sel === z.m ? " sel" : "")} style={{ fill: lv ? "var(--ac)" : "rgba(255,255,255,.1)", fillOpacity: lv ? .25 + lv * .75 : 1 }} onClick={() => onPick && onPick(z.m)}>
              <title>{MUSCLES[z.m]}</title>
              {(z.L || []).flatMap((d, i) => [<path key={"l" + i} d={d} />, <path key={"r" + i} d={d} transform={MIR} />])}
              {(z.C || []).map((d, i) => <path key={"c" + i} d={d} />)}
            </g>
          );
        })}
      </svg>
      <div className="bmt">{["front", "back"].map((k) => <button key={k} type="button" className={side === k ? "on" : ""} onClick={() => setSide(k)}>{k === "front" ? "Front" : "Back"}</button>)}</div>
      {hidden.length > 0 && !compact && <p className="bmh">On the {side === "front" ? "back" : "front"}: {hidden.map((h) => MUSCLES[h]).join(", ")}</p>}
    </div>
  );
}
