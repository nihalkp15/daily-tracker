"use client";
import { useState } from "react";
import { Card, LineChart, Ic, I } from "./ui";
import { ago } from "../lib/config";
import { dl, num } from "../lib/helpers";

const until = (d, T) => { const n = Math.round((new Date(d + "T12:00") - new Date(T + "T12:00")) / 864e5); return n === 0 ? "Today" : n === 1 ? "Tomorrow" : n < 0 ? Math.abs(n) + " days ago" : "in " + n + " days"; };

export default function Medical({ s, a }) {
  const T = ago(0);
  const [v, setV] = useState({ date: T, weight: "", sys: "", dia: "" }), [m, setM] = useState({ name: "", dose: "", time: "" }), [ap, setAp] = useState({ title: "", date: "", note: "" });
  const vit = s.vitals.slice().sort((x, y) => x.date.localeCompare(y.date)), wv = vit.filter((x) => x.weight != null).slice(-10), bp = vit.filter((x) => x.sys != null).slice(-1)[0];
  const taken = (id) => s.medLog[T]?.[id], nT = s.meds.filter((x) => taken(x.id)).length;
  const appts = s.appts.slice().sort((x, y) => x.date.localeCompare(y.date));
  const addV = (e) => { e.preventDefault(); if (v.weight === "" && v.sys === "") return; a.add("vitals", { date: v.date, weight: num(v.weight), sys: num(v.sys), dia: num(v.dia) }); setV({ ...v, weight: "", sys: "", dia: "" }); };
  const addM = (e) => { e.preventDefault(); if (!m.name.trim()) return; a.add("meds", { name: m.name.trim(), dose: m.dose.trim(), time: m.time }); setM({ name: "", dose: "", time: "" }); };
  const addA = (e) => { e.preventDefault(); if (!ap.title.trim() || !ap.date) return; a.add("appts", { title: ap.title.trim(), date: ap.date, note: ap.note.trim() }); setAp({ title: "", date: "", note: "" }); };
  return (
    <div className="g">
      <Card className="s7" i={0}>
        <div className="ch"><h3>Weight trend</h3></div>
        <div className="hl"><span>Latest</span><b>{wv.length ? wv[wv.length - 1].weight + " kg" : "–"}{bp ? "  ·  " + bp.sys + "/" + bp.dia + " mmHg" : ""}</b></div>
        {wv.length > 1 ? <LineChart id="w" fit color="#5a8dff" vals={wv.map((x) => x.weight)} labels={wv.map((x) => dl(x.date))} unit=" kg" /> : <p className="empty">Add at least two weight readings to see the trend.</p>}
      </Card>
      <Card className="s5" i={1}>
        <h3>Add a reading</h3>
        <form className="stack" onSubmit={addV}>
          <div className="r2"><label>Date<input type="date" value={v.date} onChange={(e) => setV({ ...v, date: e.target.value })} /></label><label>Weight (kg)<input type="number" step="0.1" min="0" value={v.weight} onChange={(e) => setV({ ...v, weight: e.target.value })} /></label></div>
          <div className="r2"><label>BP systolic<input type="number" min="0" value={v.sys} onChange={(e) => setV({ ...v, sys: e.target.value })} /></label><label>BP diastolic<input type="number" min="0" value={v.dia} onChange={(e) => setV({ ...v, dia: e.target.value })} /></label></div>
          <button className="white">Save reading</button>
        </form>
      </Card>
      <Card className="s5" i={2}>
        <div className="ch"><h3>Today’s medicines and supplements</h3><small className="mu">{nT}/{s.meds.length}</small></div>
        {s.meds.map((x, i) => (
          <div className={"trow" + (taken(x.id) ? " done" : "")} key={x.id} style={{ "--i": i }}>
            <button className="chk" onClick={() => a.setLog("medLog", T, x.id, taken(x.id) ? 0 : 1)} aria-label={"Mark " + x.name + " taken"}><Ic d={I.check} s={14} /></button>
            <div><b>{x.name}</b><span>{x.dose}{x.time && <em className="tag">{x.time}</em>}</span></div>
            <button className="x" onClick={() => a.del("meds", x.id)} aria-label={"Remove " + x.name}><Ic d={I.x} s={15} /></button>
          </div>
        ))}
        {!s.meds.length && <p className="empty">Nothing added yet.</p>}
        <form className="mform" onSubmit={addM}>
          <input aria-label="Name" placeholder="Name" value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} />
          <input aria-label="Dose" placeholder="Dose" value={m.dose} onChange={(e) => setM({ ...m, dose: e.target.value })} />
          <input aria-label="Time" type="time" value={m.time} onChange={(e) => setM({ ...m, time: e.target.value })} />
          <button className="white"><Ic d={I.plus} s={16} /></button>
        </form>
      </Card>
      <Card className="s7" i={3}>
        <h3>Appointments</h3>
        {appts.map((x, i) => (
          <div className="erow" key={x.id} style={{ "--i": i }}><i style={{ background: x.date < T ? "#7a6a60" : "var(--ac)" }} /><div><b>{x.title}</b><span>{dl(x.date)} · {until(x.date, T)}{x.note ? " · " + x.note : ""}</span></div><button className="x" onClick={() => a.del("appts", x.id)} aria-label={"Delete " + x.title}><Ic d={I.x} s={15} /></button></div>
        ))}
        {!appts.length && <p className="empty">No appointments yet.</p>}
        <form className="mform" onSubmit={addA}>
          <input aria-label="Appointment" placeholder="Doctor visit, test…" value={ap.title} onChange={(e) => setAp({ ...ap, title: e.target.value })} />
          <input aria-label="Date" type="date" value={ap.date} onChange={(e) => setAp({ ...ap, date: e.target.value })} />
          <input aria-label="Note" placeholder="Note" value={ap.note} onChange={(e) => setAp({ ...ap, note: e.target.value })} />
          <button className="white"><Ic d={I.plus} s={16} /></button>
        </form>
      </Card>
    </div>
  );
}
