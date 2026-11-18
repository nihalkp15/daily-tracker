"use client";
import { useState } from "react";
import { Card, CountUp, LineChart, Ic, I } from "./ui";
import { ago } from "../lib/config";
import { days, sum, dl } from "../lib/helpers";

const vol = (e) => e.sets * e.reps * (e.kg || 0);

export default function GymHistory({ s, a }) {
  const T = ago(0), D = days(14), W = days(7), [f, setF] = useState({ date: T, ex: "", sets: 3, reps: 10, kg: "" });
  const wk = s.gym.filter((e) => W.includes(e.date)), sessions = new Set(wk.map((e) => e.date)).size;
  const pr = {}; s.gym.forEach((e) => { if (pr[e.ex] == null || e.kg > pr[e.ex]) pr[e.ex] = e.kg; });
  const prs = Object.entries(pr).sort((x, y) => y[1] - x[1]).slice(0, 3);
  const dates = [...new Set(s.gym.map((e) => e.date))].sort().reverse().slice(0, 5), exs = [...new Set(s.gym.map((e) => e.ex))];
  const add = (e) => { e.preventDefault(); if (!f.ex.trim()) return; a.add("gym", { date: f.date, ex: f.ex.trim(), sets: Number(f.sets) || 1, reps: Number(f.reps) || 1, kg: Number(f.kg) || 0 }); setF({ ...f, ex: "", kg: "" }); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="g">
      <Card className="s4" i={0}>
        <h3>This week</h3>
        <div className="kp"><div><b><CountUp value={sessions} /></b><span>sessions</span></div><div><b><CountUp value={sum(wk.map(vol))} /></b><span>kg volume</span></div></div>
        <h3>Heaviest lifts</h3>
        {prs.map(([n, k]) => <div className="pr" key={n}><span>{n}</span><b>{k} kg</b></div>)}
        {!prs.length && <p className="empty">Log a set to see your bests.</p>}
      </Card>
      <Card className="s8" i={1}><h3>Daily volume, last 14 days (kg)</h3><LineChart id="gv" color="var(--ac)" vals={D.map((d) => sum(s.gym.filter((e) => e.date === d).map(vol)))} labels={D.map(dl)} unit=" kg" /></Card>
      <Card className="s5" i={2}>
        <h3>Log a set</h3>
        <form className="stack" onSubmit={add}>
          <div className="r2"><label>Date<input type="date" value={f.date} onChange={set("date")} /></label><label>Exercise<input list="exs" value={f.ex} onChange={set("ex")} placeholder="Bench press" /></label></div>
          <datalist id="exs">{exs.map((x) => <option key={x} value={x} />)}</datalist>
          <div className="r2"><label>Sets<input type="number" min="1" value={f.sets} onChange={set("sets")} /></label><label>Reps<input type="number" min="1" value={f.reps} onChange={set("reps")} /></label></div>
          <label>Weight (kg)<input type="number" min="0" step="0.5" value={f.kg} onChange={set("kg")} /></label>
          <button className="white">Add set</button>
        </form>
      </Card>
      <Card className="s7" i={3}>
        <h3>Recent sessions</h3>
        {dates.map((d) => (
          <div key={d}>
            <div className="gh"><span>{dl(d)}</span><span>{sum(s.gym.filter((e) => e.date === d).map(vol))} kg total</span></div>
            {s.gym.filter((e) => e.date === d).map((e, i) => <div className="erow" key={e.id} style={{ "--i": i }}><i style={{ background: "var(--ac)" }} /><div><b>{e.ex}</b><span>{e.sets} × {e.reps} @ {e.kg} kg</span></div><button className="x" onClick={() => a.del("gym", e.id)} aria-label={"Delete " + e.ex}><Ic d={I.x} s={15} /></button></div>)}
          </div>
        ))}
        {!dates.length && <p className="empty">No sessions yet.</p>}
      </Card>
    </div>
  );
}
