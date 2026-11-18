"use client";
import { useState } from "react";
import { Card, CountUp, Spark, LineChart, Ic, I } from "./ui";
import { ago, CUR, LISTS } from "../lib/config";
import { days, sum, spendOn, dl, due, num } from "../lib/helpers";

const MET = { sleep: ["Sleep", "h", "#d9c94a"], focus: ["Focus", "h", "#ff9a3d"], workout: ["Workout", "min", "#37d67a"], mood: ["Mood", "/5", "#ff5aa5"] };
export default function Log({ s, a }) {
  const [date, setDate] = useState(ago(0)), [m, setM] = useState("sleep"), r = s.logs[date] || {};
  const [f, setF] = useState({ sleep: r.sleep ?? "", workout: r.workout ?? "", focus: r.focus ?? "", mood: r.mood || 0 });
  const pick = (d) => { setDate(d); const x = s.logs[d] || {}; setF({ sleep: x.sleep ?? "", workout: x.workout ?? "", focus: x.focus ?? "", mood: x.mood || 0 }); };
  const save = (e) => { e.preventDefault(); a.saveLog(date, { sleep: num(f.sleep), workout: num(f.workout), focus: num(f.focus), mood: f.mood || null }); };
  const D = days(14); let streak = 0; for (let i = 0; s.logs[ago(i)] || (i === 0 && !s.logs[ago(0)] && ++i); ) { if (s.logs[ago(i)]) streak++; else break; i++; }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="g">
      <Card className="s5" i={0}>
        <h3>Log a day</h3>
        <form className="stack" onSubmit={save}>
          <div className="r2"><label>Date<input type="date" value={date} onChange={(e) => pick(e.target.value)} /></label><label>Sleep (h)<input type="number" step="0.25" min="0" max="24" value={f.sleep} onChange={set("sleep")} /></label></div>
          <div className="r2"><label>Focus (h)<input type="number" step="0.25" min="0" max="24" value={f.focus} onChange={set("focus")} /></label><label>Workout (min)<input type="number" min="0" value={f.workout} onChange={set("workout")} /></label></div>
          <div className="mo">Mood<div>{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} className={f.mood === n ? "on" : ""} onClick={() => setF({ ...f, mood: n })}>{n}</button>)}</div></div>
          <button className="white">Save entry</button>
        </form>
      </Card>
      <Card className="s7" i={1}>
        <div className="ch"><h3>Last 14 days</h3><small className="mu">{streak} day streak</small></div>
        <div className="chips">{Object.keys(MET).map((k) => <button key={k} className={"chip" + (m === k ? " on" : "")} onClick={() => setM(k)}>{MET[k][0]}</button>)}</div>
        <LineChart key={m} id={"l" + m} color={MET[m][2]} vals={D.map((d) => s.logs[d]?.[m] ?? 0)} labels={D.map(dl)} unit={" " + MET[m][1]} />
      </Card>
      <Card className="s12" i={2}>
        <h3>Recent days</h3>
        {Object.keys(s.logs).sort().reverse().slice(0, 6).map((d, i) => { const x = s.logs[d]; return (
          <button className="lrow" key={d} style={{ "--i": i }} onClick={() => pick(d)}><div className="dt">{d.slice(8)}</div><b>{dl(d)}</b><span>Sleep {x.sleep ?? "–"} h</span><span>Focus {x.focus ?? "–"} h</span><span>Workout {x.workout ?? "–"} min</span><Spark vals={D.slice(-7).map((q) => s.logs[q]?.focus ?? 0)} /></button>); })}
        {!Object.keys(s.logs).length && <p className="empty">No entries yet.</p>}
      </Card>
    </div>
  );
}
