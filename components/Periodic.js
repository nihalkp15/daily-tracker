"use client";
// Monthly and weekly items you define yourself: Buy (with a count) or Do (errand). Resets automatically.
import { useState } from "react";
import { Card, Ic, I } from "./ui";
import { ago, CUR } from "../lib/config";
import { sum } from "../lib/helpers";
import { doneCount, daysLeft, resetText, startOf } from "../lib/periodic";

function Form({ init, onSave, onCancel, onDelete }) {
  const [f, setF] = useState({ name: "", period: "month", kind: "buy", count: 1, ...init });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const go = (e) => { e.preventDefault(); if (!f.name.trim()) return; onSave({ name: f.name.trim(), period: f.period, kind: f.kind, count: Math.max(1, Math.min(31, Number(f.count) || 1)) }); };
  return (
    <form className="rform" onSubmit={go}>
      <label>Item<input value={f.name} onChange={set("name")} placeholder="e.g. T-shirt" autoFocus /></label>
      <label>Type<select value={f.kind} onChange={set("kind")}><option value="buy">Buy</option><option value="do">Do (errand)</option></select></label>
      <label>Every<select value={f.period} onChange={set("period")}><option value="week">Week</option><option value="month">Month</option></select></label>
      <label>Count<input type="number" min="1" max="31" value={f.count} onChange={set("count")} /></label>
      <div className="fa"><button className="white">Save</button><button type="button" className="ghost" onClick={onCancel}>Cancel</button>{onDelete && <button type="button" className="x" onClick={onDelete} aria-label="Delete item"><Ic d={I.x} s={15} /></button>}</div>
    </form>
  );
}

export default function Periodic({ s, a, i = 3 }) {
  const T = ago(0), [edit, setEdit] = useState(null), [ask, setAsk] = useState(null);
  const ecats = s.money.cats.expense, accts = s.money.accounts, n = (r) => doneCount(s, r, T);
  const total = sum(s.periodic.map((r) => r.count)), got = sum(s.periodic.map((r) => Math.min(n(r), r.count)));
  const log = (r) => a.add("pLog", { item: r.id, date: T });
  const undo = (r) => { const st = startOf(r.period, T), last = s.pLog.filter((e) => e.item === r.id && e.date >= st).sort((x, y) => y.date.localeCompare(x.date))[0]; if (last) a.del("pLog", last.id); };
  const press = (r) => { const over = n(r) >= r.count; if (r.kind === "do" && !over) log(r); else setAsk({ id: r.id, over, price: "", cat: (ecats.find((c) => c.name === "Shopping") || ecats[0])?.name || "", acct: accts[0]?.name || "" }); };
  const confirmAdd = (r, withPrice) => { log(r); const amt = Number(ask.price); if (r.kind === "buy" && withPrice && amt > 0) a.addExp({ amt, date: T, cat: ask.cat, sub: "", acct: ask.acct, note: r.name }); setAsk(null); };
  const group = (period, title) => {
    const items = s.periodic.filter((r) => r.period === period); if (!items.length) return null;
    return (
      <div key={period}>
        <div className="sec">{title} · {resetText(period, T)}</div>
        {items.map((r, k) => {
          if (edit === r.id) return <Form key={r.id} init={r} onSave={(v) => { a.patch("periodic", r.id, v); setEdit(null); }} onCancel={() => setEdit(null)} onDelete={() => { a.del("periodic", r.id); setEdit(null); }} />;
          const c = n(r), left = daysLeft(r.period, T), soon = c < r.count && left <= (r.period === "week" ? 2 : 5);
          return (
            <div key={r.id}>
              <div className={"trow" + (c >= r.count ? " done" : "")} style={{ "--i": Math.min(k, 12) }}>
                <div className="pdots">{Array.from({ length: Math.min(r.count, 8) }, (_, j) => <i key={j} className={j < c ? "on" : ""} />)}</div>
                <div><b>{r.name}</b><span><em className="tag">{r.kind === "buy" ? "Buy" : "Do"}</em><em>{c}/{r.count}</em>{soon && <em className="soon">{left === 0 ? "last day" : left + (left === 1 ? " day left" : " days left")}</em>}</span></div>
                <button className="btn-sm" disabled={!c} onClick={() => undo(r)} aria-label={"Undo one " + r.name}>−</button>
                <button className="btn-sm" onClick={() => press(r)} aria-label={"Add one " + r.name}>+</button>
                <button className="x" onClick={() => setEdit(r.id)} aria-label={"Edit " + r.name}><Ic d={I.edit} s={15} /></button>
              </div>
              {ask?.id === r.id && (
                <div className="askp">
                  {ask.over && <p className="warn">Already {c}/{r.count} this {r.period}. Add another anyway?</p>}
                  {r.kind === "buy" && <>
                    <input type="number" inputMode="decimal" min="0" placeholder={"Price (" + CUR + ")"} aria-label="Price" value={ask.price} onChange={(e) => setAsk({ ...ask, price: e.target.value })} />
                    <select aria-label="Expense category" value={ask.cat} onChange={(e) => setAsk({ ...ask, cat: e.target.value })}>{ecats.map((x) => <option key={x.name}>{x.name}</option>)}</select>
                    <select aria-label="Account" value={ask.acct} onChange={(e) => setAsk({ ...ask, acct: e.target.value })}>{accts.map((x) => <option key={x.name}>{x.name}</option>)}</select>
                  </>}
                  <button className="white" onClick={() => confirmAdd(r, true)}>{r.kind === "buy" ? "Add + log expense" : "Add anyway"}</button>
                  {r.kind === "buy" && <button className="ghost" onClick={() => confirmAdd(r, false)}>Skip price</button>}
                  <button className="link" onClick={() => setAsk(null)}>Cancel</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <Card className="s12" i={i}>
      <div className="ch"><h3>Monthly and weekly · your own limits</h3><button className="link" onClick={() => setEdit("new")}>+ Add item</button></div>
      {total > 0 && <div className="rsum"><span><b>{got}/{total}</b> done this period</span><div className="bar"><i style={{ width: got / total * 100 + "%" }} /></div></div>}
      {edit === "new" && <Form onSave={(v) => { a.add("periodic", v); setEdit(null); }} onCancel={() => setEdit(null)} />}
      {group("week", "This week")}
      {group("month", "This month")}
      {!s.periodic.length && edit !== "new" && <p className="empty">Add items like “Pant ×1 per month” or “Dress ×2 per week”.</p>}
    </Card>
  );
}
