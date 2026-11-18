"use client";
import { useState } from "react";
import { Card, CountUp, Spark, LineChart, Ic, I } from "./ui";
import { ago, CUR, LISTS } from "../lib/config";
import { days, sum, spendOn, dl, due, num } from "../lib/helpers";

export default function TaskRow({ t, a, i }) {
  const dd = due(t);
  return (
    <div className={"trow" + (t.done ? " done" : "")} style={{ "--i": Math.min(i, 12) }}>
      <button className="chk" onClick={() => a.toggle(t.id)} aria-label={(t.done ? "Mark not done: " : "Mark done: ") + t.text}><Ic d={I.check} s={14} /></button>
      <div><b>{t.text}</b><span><em className="tag">{t.list}</em>{dd && <em className={"due" + (dd === "Overdue" ? " late" : "")}>{dd}</em>}</span></div>
      <button className="x" onClick={() => a.delTask(t.id)} aria-label={"Delete " + t.text}><Ic d={I.x} s={15} /></button>
    </div>
  );
}

