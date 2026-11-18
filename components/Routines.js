"use client";
// Daily repeatable actions: editable, resets every day, tracks a 7-day streak per action.
import { useState } from "react";
import { Card, Ic, I } from "./ui";
import { ago } from "../lib/config";
import { days } from "../lib/helpers";

const stepOf = (r) => (r.target <= 5 ? 0.5 : 1);

function Form({ init, onSave, onCancel, onDelete }) {
  const [f, setF] = useState({ text: "", time: "", target: "", unit: "", ...init });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const go = (e) => { e.preventDefault(); if (!f.text.trim()) return; onSave({ text: f.text.trim(), time: f.time || "", target: f.target === "" || f.target == null ? null : Number(f.target), unit: (f.unit || "").trim() }); };
  return (
    <form className="rform" onSubmit={go}>
      <label>Action<input value={f.text} onChange={set("text")} placeholder="e.g. Drink water" autoFocus /></label>
      <label>By time<input type="time" value={f.time || ""} onChange={set("time")} /></label>
      <label>Daily target<input type="number" min="0" step="0.5" value={f.target ?? ""} onChange={set("target")} placeholder="optional" /></label>
      <label>Unit<input value={f.unit || ""} onChange={set("unit")} placeholder="L, min…" /></label>
      <div className="fa"><button className="white">Save</button><button type="button" className="ghost" onClick={onCancel}>Cancel</button>{onDelete && <button type="button" className="x" onClick={onDelete} aria-label="Delete routine"><Ic d={I.x} s={15} /></button>}</div>
    </form>
  );
}

export default function Routines({ s, a, i = 2 }) {
  const T = ago(0), D = days(7), [edit, setEdit] = useState(null);
  const val = (r, d) => s.routineLog[d]?.[r.id] || 0, done = (r, d) => val(r, d) >= (r.target || 1);
  const n = s.routines.filter((r) => done(r, T)).length, tot = s.routines.length;
  const bump = (r, dlt) => a.setLog("routineLog", T, r.id, Math.max(0, +(val(r, T) + dlt).toFixed(1)));
  return (
    <Card className="s12" i={i}>
      <div className="ch"><h3>Daily routine · repeats every day</h3><button className="link" onClick={() => setEdit("new")}>+ Add action</button></div>
      {tot > 0 && <div className="rsum"><span><b>{n}/{tot}</b> done today</span><div className="bar"><i style={{ width: n / tot * 100 + "%" }} /></div></div>}
      {edit === "new" && <Form onSave={(v) => { a.add("routines", v); setEdit(null); }} onCancel={() => setEdit(null)} />}
      {s.routines.map((r, k) => edit === r.id ? (
        <Form key={r.id} init={r} onSave={(v) => { a.patch("routines", r.id, v); setEdit(null); }} onCancel={() => setEdit(null)} onDelete={() => { a.del("routines", r.id); setEdit(null); }} />
      ) : (
        <div className={"trow" + (done(r, T) ? " done" : "")} key={r.id} style={{ "--i": Math.min(k, 12) }}>
          {r.target ? (
            <div className="step"><button onClick={() => bump(r, -stepOf(r))} aria-label={"Decrease " + r.text}>−</button><strong>{val(r, T)}/{r.target} {r.unit}</strong><button onClick={() => bump(r, stepOf(r))} aria-label={"Increase " + r.text}>+</button></div>
          ) : (
            <button className="chk" onClick={() => a.setLog("routineLog", T, r.id, val(r, T) ? 0 : 1)} aria-label={(done(r, T) ? "Mark not done: " : "Mark done: ") + r.text}><Ic d={I.check} s={14} /></button>
          )}
          <div><b>{r.text}</b><span>{r.time && <em className="tag">by {r.time}</em>}{r.target ? <em>target {r.target} {r.unit}</em> : null}</span>{r.target ? <div className="mini"><i style={{ width: Math.min(100, val(r, T) / r.target * 100) + "%" }} /></div> : null}</div>
          <div className="rdots" title="Last 7 days">{D.map((d) => <i key={d} className={done(r, d) ? "on" : ""} />)}</div>
          <button className="x" onClick={() => setEdit(r.id)} aria-label={"Edit " + r.text}><Ic d={I.edit} s={15} /></button>
        </div>
      ))}
      {!tot && edit !== "new" && <p className="empty">No daily actions yet. Add things like “Wake up by 8” or “Drink 3 L water”.</p>}
    </Card>
  );
}
