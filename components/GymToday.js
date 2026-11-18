"use client";
// Today's workout: tick sets, watch the muscle map light up, finish to save to History.
import { useMemo, useState } from "react";
import { Card, Ic, I } from "./ui";
import BodyMap from "./BodyMap";
import { ago } from "../lib/config";
import { sum } from "../lib/helpers";
import { MUSCLES } from "../lib/exercises";
import { look, todayWorkout, lastKg, workoutLevels, weekLevels, muscleInfo, weekStrip, streak } from "../lib/gymtools";

function Confetti() {
  const bits = useMemo(() => Array.from({ length: 36 }, (_, i) => ({ x: (Math.random() - .5) * 620, y: -(120 + Math.random() * 300), r: (Math.random() - .5) * 720, c: ["var(--ac)", "var(--ac2)", "#fff"][i % 3], d: Math.random() * .25 })), []);
  return <div className="cf" aria-hidden="true">{bits.map((b, i) => <i key={i} style={{ "--x": b.x + "px", "--y": b.y + "px", "--r": b.r + "deg", background: b.c, animationDelay: b.d + "s" }} />)}</div>;
}

export default function GymToday({ s, a }) {
  const T = ago(0), { wid, W } = todayWorkout(s), ss = s.sess[T] || {}, done = ss.done || {}, kgs = ss.kg || {}, fin = !!ss.fin;
  const [mode, setMode] = useState("today"), [sel, setSel] = useState(null), [boom, setBoom] = useState(false);
  const total = W ? sum(W.exercises.map((e) => e.sets)) : 0, dn = W ? sum(W.exercises.map((e, i) => Math.min(e.sets, done[i] || 0))) : 0, pct = total ? Math.round(dn / total * 100) : 0;
  const levels = mode === "week" || !W ? weekLevels(s) : workoutLevels(s, W, done);
  const put = (v) => a.sess(T, { w: wid, ...v });
  const tick = (i, k) => put({ done: { ...done, [i]: (done[i] || 0) === k + 1 ? k : k + 1 } });
  const weight = (i, e) => kgs[i] ?? lastKg(s, e.ex) ?? (e.kg || "");
  const finish = () => {
    W.exercises.forEach((e, i) => { const n = Math.min(e.sets, done[i] || 0); if (n > 0) a.add("gym", { date: T, ex: e.ex, sets: n, reps: e.reps, kg: Number(weight(i, e)) || 0 }); });
    put({ fin: true }); setBoom(true); setTimeout(() => setBoom(false), 2400);
  };
  const info = sel ? muscleInfo(s, sel) : null, st = streak(s), strip = weekStrip(s);
  const msg = fin ? "Workout done. Rest up, you earned it." : !W ? "Rest is where the muscle gets built." : pct === 0 ? "Let’s get the first set done." : pct < 50 ? "Good start. Keep the momentum." : pct < 100 ? "Past halfway. Finish strong." : "Every set done. Hit finish!";
  return (
    <div className="g">
      {boom && <Confetti />}
      <Card className="s7" i={0}>
        <div className="ch"><h3>{W ? "Today’s workout" : "Today"}</h3><span className="stk">🔥 {st > 0 ? st + " workout streak" : "Start your streak today"}</span></div>
        <h2 className="wt">{W ? W.name : "Rest day"}</h2>
        <p className="mu wm">{msg}</p>
        {W && <><div className="bar"><i style={{ width: pct + "%" }} /></div><div className="hl"><span>{dn}/{total} sets</span><b>{pct}%</b></div></>}
        <div className="wa">
          {W && (fin ? <span className="stk big">✓ Saved to History</span> : <button className="cta" disabled={dn === 0} onClick={finish}>Finish workout</button>)}
          <label className="swp">Workout<select value={wid} disabled={dn > 0 || fin} onChange={(e) => a.sess(T, { w: e.target.value, done: {}, kg: {} })}><option value="rest">Rest day</option>{Object.keys(s.plan.workouts).map((id) => <option key={id} value={id}>{s.plan.workouts[id].name}</option>)}</select></label>
        </div>
        <div className="wk">{strip.map((d, i) => <div key={i} className={d.state}><span>{d.l}</span><i>{d.state === "done" ? <Ic d={I.check} s={14} /> : d.state === "rest" ? "–" : ""}</i></div>)}</div>
      </Card>
      <Card className="s5" i={1}>
        <div className="ch"><h3>Muscle map</h3>{W && <div className="chips" style={{ margin: 0 }}>{[["today", "Today"], ["week", "This week"]].map(([k, l]) => <button key={k} className={"chip" + (mode === k ? " on" : "")} onClick={() => setMode(k)}>{l}</button>)}</div>}</div>
        <BodyMap theme={s.theme} levels={levels} sel={sel} onPick={(m) => setSel(sel === m ? null : m)} />
        <p className="bmh">{info ? MUSCLES[sel] + " · " + (info.last == null ? "not trained yet" : info.last === 0 ? "trained today" : "last trained " + info.last + (info.last === 1 ? " day" : " days") + " ago") + " · " + info.sets + " sets this week" : (mode === "week" || !W ? "Brighter means more work this week. Tap a muscle." : "Glowing muscles are in today’s workout. Tap one for details.")}</p>
      </Card>
      {W && (
        <Card className="s12" i={2}>
          <h3>Exercises</h3>
          {W.exercises.map((e, i) => {
            const n = Math.min(e.sets, done[i] || 0), lk = lastKg(s, e.ex);
            return (
              <div className={"ex" + (n >= e.sets ? " ok" : "")} key={i} style={{ "--i": i }}>
                <div className="exh"><div><b>{e.ex}</b><span>{look(s, e.ex).m.map((m) => MUSCLES[m]).join(" · ")}</span></div>
                  <label className="kg"><input type="number" inputMode="decimal" step="0.5" min="0" aria-label={"Weight for " + e.ex} value={weight(i, e)} disabled={fin} onChange={(ev) => put({ kg: { ...kgs, [i]: ev.target.value } })} />kg</label></div>
                <div className="sets">{Array.from({ length: e.sets }, (_, k) => <button key={k} disabled={fin} className={k < n ? "on" : ""} onClick={() => tick(i, k)} aria-label={"Set " + (k + 1) + " of " + e.sets}>{k < n ? <Ic d={I.check} s={16} /> : e.reps}</button>)}</div>
                <small className="exs">{e.sets} sets × {e.reps} reps{lk ? " · last time " + lk + " kg" : ""}</small>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
