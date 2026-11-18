"use client";
// Muscle map using the react-body-highlighter library (proper anatomy art).
// levels = { muscleId: 0..1 } from lib/gymtools.js. The old hand-drawn version is kept in BodyMapSimple.js as a fallback.
import { useMemo, useState } from "react";
import Model from "react-body-highlighter";
import { MUSCLES } from "../lib/exercises";
import { THEMES } from "../lib/themes";

const TO_LIB = { chest: ["chest"], shoulders: ["front-deltoids", "back-deltoids"], biceps: ["biceps"], triceps: ["triceps"], forearms: ["forearm"], abs: ["abs"], obliques: ["obliques"], traps: ["trapezius"], lats: ["upper-back"], upperback: ["upper-back"], lowerback: ["lower-back"], glutes: ["gluteal"], quads: ["quadriceps"], hamstrings: ["hamstring"], calves: ["calves"] };
const FROM_LIB = { "front-deltoids": "shoulders", "back-deltoids": "shoulders", forearm: "forearms", trapezius: "traps", "upper-back": "upperback", "lower-back": "lowerback", gluteal: "glutes", quadriceps: "quads", hamstring: "hamstrings" };
const FRONT = new Set(["chest", "front-deltoids", "biceps", "forearm", "abs", "obliques", "quadriceps", "trapezius", "calves"]);
const BACK = new Set(["trapezius", "upper-back", "lower-back", "back-deltoids", "triceps", "forearm", "hamstring", "gluteal", "calves"]);
const STEPS = 5, ALPHA = ["55", "77", "99", "cc", "ff"];

export default function BodyMap({ levels = {}, onPick, compact, theme = "ember" }) {
  const [side, setSide] = useState("front");
  const accent = (THEMES.find((t) => t.id === theme) || THEMES[0]).a, colors = ALPHA.map((x) => accent + x);
  const data = useMemo(() => {
    const lv = {}; Object.entries(levels).forEach(([m, v]) => (TO_LIB[m] || []).forEach((k) => { lv[k] = Math.max(lv[k] || 0, v); }));
    const out = []; Object.entries(lv).forEach(([k, v]) => { const n = Math.max(1, Math.min(STEPS, Math.ceil(v * STEPS))); for (let i = 0; i < n; i++) out.push({ name: k + i, muscles: [k] }); }); // frequency n -> colour n
    return out;
  }, [levels]);
  const here = side === "front" ? FRONT : BACK;
  const hidden = Object.keys(levels).filter((m) => levels[m] > 0 && !(TO_LIB[m] || []).some((k) => here.has(k)));
  return (
    <div className={"bm" + (compact ? " cp" : "")}>
      <Model data={data} type={side === "front" ? "anterior" : "posterior"} bodyColor="#ffffff22" highlightedColors={colors}
        onClick={({ muscle }) => onPick && onPick(FROM_LIB[muscle] || muscle)} style={{ width: "100%", maxWidth: compact ? 150 : 230 }} svgStyle={{ width: "100%", height: "auto" }} />
      <div className="bmt">{["front", "back"].map((k) => <button key={k} type="button" className={side === k ? "on" : ""} onClick={() => setSide(k)}>{k === "front" ? "Front" : "Back"}</button>)}</div>
      {hidden.length > 0 && !compact && <p className="bmh">On the {side === "front" ? "back" : "front"}: {hidden.map((h) => MUSCLES[h]).join(", ")}</p>}
    </div>
  );
}
