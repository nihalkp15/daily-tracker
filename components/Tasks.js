"use client";
import { useState } from "react";
import { Card, CountUp, Ic, I } from "./ui";
import { LISTS } from "../lib/config";
import TaskRow from "./TaskRow";
import Routines from "./Routines";
import Periodic from "./Periodic";

export default function Tasks({ s, a }) {
  const [text, setText] = useState(""), [list, setList] = useState("Buy"), [dueD, setDue] = useState(""), [fl, setFl] = useState("All");
  const done = s.tasks.filter((t) => t.done).length, tot = s.tasks.length, p = tot ? Math.round(done / tot * 100) : 0;
  const shown = s.tasks.filter((t) => (fl === "All" ? true : fl === "Done" ? t.done : t.list === fl && !t.done));
  const add = (e) => { e.preventDefault(); if (!text.trim()) return; a.addTask({ text: text.trim(), list, due: dueD }); setText(""); setDue(""); };
  return (
    <div className="g">
      <Card className="s4" i={0}><h3>Progress</h3><div className="big"><CountUp value={done} /><em> / {tot}</em></div><div className="bar"><i style={{ width: p + "%" }} /></div><small className="mu">{p}% of tasks done</small></Card>
      <Card className="s8" i={1}>
        <h3>New task</h3>
        <form className="addrow" onSubmit={add}>
          <input aria-label="Task" placeholder="What needs doing?" value={text} onChange={(e) => setText(e.target.value)} />
          <select aria-label="List" value={list} onChange={(e) => setList(e.target.value)}>{LISTS.map((l) => <option key={l}>{l}</option>)}</select>
          <input aria-label="Due date" type="date" value={dueD} onChange={(e) => setDue(e.target.value)} />
          <button className="white"><Ic d={I.plus} s={16} /> Add</button>
        </form>
      </Card>
      <Routines s={s} a={a} i={2} />
      <Periodic s={s} a={a} i={3} />
      <Card className="s12" i={4}>
        <h3>One-off tasks</h3>
        <div className="chips">{["All", ...LISTS, "Done"].map((f) => <button key={f} className={"chip" + (fl === f ? " on" : "")} onClick={() => setFl(f)}>{f}</button>)}</div>
        {shown.map((t, i) => <TaskRow key={t.id} t={t} a={a} i={i} />)}
        {!shown.length && <p className="empty">Nothing here yet.</p>}
      </Card>
    </div>
  );
}
