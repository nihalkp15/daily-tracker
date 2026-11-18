"use client";
// Weekly schedule and workout editor. Everything here is editable.
import { useState } from "react";
import { Card, Ic, I } from "./ui";
import { DAYS, MUSCLES } from "../lib/exercises";
import { lookup } from "../lib/gymtools";

const clone = (o) => JSON.parse(JSON.stringify(o));

export default function GymPlan({ s, a }) {
  const { week, workouts } = s.plan, ids = Object.keys(workouts), L = lookup(s);
  const [sel, setSel] = useState(ids[0] || ""), [nx, setNx] = useState({ ex: "", sets: 3, reps: 10 }), [pick, setPick] = useState([]);
  const W = workouts[sel], upd = (fn) => a.plan((p) => fn(clone(p)));
  const setEx = (i, k, v) => upd((p) => { p.workouts[sel].exercises[i][k] = v; return p; });
  const delEx = (i) => upd((p) => { p.workouts[sel].exercises.splice(i, 1); return p; });
  const newName = nx.ex.trim(), unknown = newName && !L[newName];
  const addEx = (e) => {
    e.preventDefault(); if (!newName || (unknown && !pick.length)) return;
    if (unknown) a.addEx(newName, pick);
    upd((p) => { p.workouts[sel].exercises.push({ ex: newName, sets: Math.max(1, +nx.sets || 3), reps: Math.max(1, +nx.reps || 10), kg: 0 }); return p; });
    setNx({ ex: "", sets: 3, reps: 10 }); setPick([]);
  };
  const newW = () => { const id = "w" + Date.now().toString(36); upd((p) => { p.workouts[id] = { name: "New workout", exercises: [] }; return p; }); setSel(id); };
  const delW = () => { const rest = ids.find((x) => x !== sel); upd((p) => { delete p.workouts[sel]; Object.keys(p.week).forEach((d) => { if (p.week[d] === sel) p.week[d] = "rest"; }); return p; }); setSel(rest || ""); };
  return (
    <div className="g">
      <Card className="s5" i={0}>
        <h3>Weekly schedule</h3>
        {DAYS.map(([k, n]) => (
          <label className="drow" key={k}><span>{n}</span>
            <select value={week[k] || "rest"} onChange={(e) => upd((p) => { p.week[k] = e.target.value; return p; })}><option value="rest">Rest day</option>{ids.map((id) => <option key={id} value={id}>{workouts[id].name}</option>)}</select></label>
        ))}
      </Card>
      <Card className="s7" i={1}>
        <div className="chips">{ids.map((id) => <button key={id} className={"chip" + (sel === id ? " on" : "")} onClick={() => setSel(id)}>{workouts[id].name}</button>)}<button className="chip" onClick={newW}>+ New</button></div>
        {W ? (
          <>
            <div className="fa" style={{ marginTop: 8 }}><input aria-label="Workout name" value={W.name} onChange={(e) => upd((p) => { p.workouts[sel].name = e.target.value; return p; })} /><button className="x" onClick={delW} aria-label="Delete workout"><Ic d={I.x} s={15} /></button></div>
            {W.exercises.map((e, i) => (
              <div className="pex" key={i}>
                <b>{e.ex}<small>{(L[e.ex]?.m || []).map((m) => MUSCLES[m]).join(", ")}</small></b>
                <input type="number" min="1" aria-label="Sets" value={e.sets} onChange={(ev) => setEx(i, "sets", Math.max(1, Number(ev.target.value) || 1))} />
                <input type="number" min="1" aria-label="Reps" value={e.reps} onChange={(ev) => setEx(i, "reps", Math.max(1, Number(ev.target.value) || 1))} />
                <input type="number" min="0" step="0.5" aria-label="Target kg" value={e.kg || ""} placeholder="kg" onChange={(ev) => setEx(i, "kg", Number(ev.target.value) || 0)} />
                <button className="x" onClick={() => delEx(i)} aria-label={"Remove " + e.ex}><Ic d={I.x} s={15} /></button>
              </div>
            ))}
            <form className="mform" onSubmit={addEx}>
              <input list="exl" aria-label="Exercise" placeholder="Add exercise" value={nx.ex} onChange={(e) => setNx({ ...nx, ex: e.target.value })} />
              <datalist id="exl">{Object.keys(L).map((n) => <option key={n} value={n} />)}</datalist>
              <input type="number" min="1" aria-label="Sets" value={nx.sets} onChange={(e) => setNx({ ...nx, sets: e.target.value })} />
              <input type="number" min="1" aria-label="Reps" value={nx.reps} onChange={(e) => setNx({ ...nx, reps: e.target.value })} />
              <button className="white" aria-label="Add exercise"><Ic d={I.plus} s={16} /></button>
            </form>
            {unknown && <><p className="mu" style={{ margin: "12px 0 6px", fontSize: 12 }}>New exercise. Which muscles does it train?</p><div className="chips">{Object.keys(MUSCLES).map((m) => <button type="button" key={m} className={"chip" + (pick.includes(m) ? " on" : "")} onClick={() => setPick(pick.includes(m) ? pick.filter((x) => x !== m) : [...pick, m])}>{MUSCLES[m]}</button>)}</div></>}
          </>
        ) : <p className="empty">No workouts yet. Tap + New.</p>}
      </Card>
    </div>
  );
}
