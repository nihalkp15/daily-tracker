"use client";
// Money overview: income, spending, accounts, charts and the add-transaction form.
import { useState } from "react";
import { Card, CountUp, LineChart, Ic, I } from "./ui";
import { ago, CUR } from "../lib/config";
import { days, sum, dl, catColor } from "../lib/helpers";

export default function MoneyOverview({ s, a }) {
  const { cats, accounts } = s.money, T = ago(0), mo = T.slice(0, 7), D = days(14);
  const [type, setType] = useState("expense"), [view, setView] = useState("expense"), [flt, setFlt] = useState("all");
  const [f, setF] = useState({ amt: "", date: T, cat: "", sub: "", acct: accounts[0]?.name || "", note: "" });
  const list = cats[type], cat = list.find((c) => c.name === f.cat) || list[0], subs = cat?.subs || [];
  const inMonth = (arr) => arr.filter((e) => e.date.startsWith(mo));
  const exp = sum(inMonth(s.expenses).map((e) => e.amt)), inc = sum(inMonth(s.incomes).map((e) => e.amt)), net = inc - exp;
  const balance = (acc) => (acc.opening || 0) + sum(s.incomes.filter((e) => e.acct === acc.name).map((e) => e.amt)) - sum(s.expenses.filter((e) => e.acct === acc.name).map((e) => e.amt));
  const src = view === "expense" ? s.expenses : s.incomes;
  const byCat = {}; inMonth(src).forEach((e) => { const c = (byCat[e.cat] ||= { total: 0, subs: {} }); c.total += e.amt; if (e.sub) c.subs[e.sub] = (c.subs[e.sub] || 0) + e.amt; });
  const rows = Object.entries(byCat).sort((x, y) => y[1].total - x[1].total), top = rows.length ? rows[0][1].total : 1;
  const all = [...s.expenses.map((e) => ({ ...e, t: "expense" })), ...s.incomes.map((e) => ({ ...e, t: "income" }))].filter((r) => flt === "all" || r.t === flt).sort((x, y) => y.date.localeCompare(x.date)).slice(0, 10);
  const add = (e) => {
    e.preventDefault(); const amt = Number(f.amt); if (!(amt > 0) || !cat) return;
    const rec = { amt, date: f.date, cat: cat.name, sub: f.sub, acct: f.acct, note: f.note.trim() };
    if (type === "expense") a.addExp(rec); else a.add("incomes", rec);
    setF({ ...f, amt: "", note: "" });
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="g">
      <Card className="s4" i={0}><h3>Income this month</h3><div className="big pos"><CountUp value={inc} prefix={CUR} /></div></Card>
      <Card className="s4" i={1}><h3>Spent this month</h3><div className="big"><CountUp value={exp} prefix={CUR} /></div></Card>
      <Card className="s4" i={2}><h3>Net this month</h3><div className={"big " + (net >= 0 ? "pos" : "neg")}>{net < 0 ? "−" : ""}{CUR}<CountUp value={Math.abs(net)} /></div></Card>
      <Card className="s5" i={3}>
        <h3>Accounts</h3>
        {accounts.map((x) => { const b = balance(x); return <div className="erow" key={x.name}><i style={{ background: "var(--ac)" }} /><div><b>{x.name}</b><span>{x.name === "Cash" ? "Cash in hand" : "Balance"}</span></div><strong className={b < 0 ? "neg" : ""}>{b < 0 ? "−" : ""}{CUR}{Math.abs(Math.round(b)).toLocaleString()}</strong></div>; })}
        {!accounts.length && <p className="empty">Add accounts under Categories.</p>}
      </Card>
      <Card className="s7" i={4}>
        <div className="chips">{[["expense", "Spending"], ["income", "Income"]].map(([k, l]) => <button key={k} className={"chip" + (view === k ? " on" : "")} onClick={() => setView(k)}>{l}</button>)}</div>
        <LineChart key={view} id={"m" + view} color={view === "income" ? "#37d67a" : "var(--ac2)"} vals={D.map((d) => sum(src.filter((e) => e.date === d).map((e) => e.amt)))} labels={D.map(dl)} unit={CUR} />
      </Card>
      <Card className="s5" i={5}>
        <div className="chips">{[["expense", "Expense"], ["income", "Income"]].map(([k, l]) => <button key={k} type="button" className={"chip" + (type === k ? " on" : "")} onClick={() => { setType(k); setF({ ...f, cat: "", sub: "" }); }}>{l}</button>)}</div>
        <form className="stack" onSubmit={add}>
          <div className="r2"><label>Amount ({CUR})<input type="number" min="0" step="0.01" inputMode="decimal" value={f.amt} onChange={set("amt")} /></label><label>Date<input type="date" value={f.date} onChange={set("date")} /></label></div>
          <div className="r2">
            <label>Category<select value={cat?.name || ""} onChange={(e) => setF({ ...f, cat: e.target.value, sub: "" })}>{list.map((c) => <option key={c.name}>{c.name}</option>)}</select></label>
            <label>Sub-category<select value={f.sub} onChange={set("sub")}><option value="">None</option>{subs.map((x) => <option key={x}>{x}</option>)}</select></label>
          </div>
          <div className="r2"><label>Account<select value={f.acct} onChange={set("acct")}>{accounts.map((x) => <option key={x.name}>{x.name}</option>)}</select></label><label>Note<input value={f.note} onChange={set("note")} placeholder="Optional" /></label></div>
          <button className="white">{type === "expense" ? "Add expense" : "Add income"}</button>
        </form>
      </Card>
      <Card className="s7" i={6}>
        <h3>{view === "expense" ? "Spending" : "Income"} by category, this month</h3>
        {rows.map(([name, c], k) => (
          <div className="cb" key={name}>
            <div><span><i style={{ background: view === "expense" ? catColor(s, name) : "var(--ac)" }} />{name}</span><b>{CUR}{c.total}</b></div>
            <div className="bar"><i style={{ width: c.total / top * 100 + "%", background: view === "expense" ? catColor(s, name) : undefined, animationDelay: 300 + k * 80 + "ms" }} /></div>
            {Object.keys(c.subs).length > 0 && <small className="mu">{Object.entries(c.subs).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([k2, v]) => k2 + " " + CUR + v).join(" · ")}</small>}
          </div>
        ))}
        {!rows.length && <p className="empty">Nothing this month yet.</p>}
      </Card>
      <Card className="s12" i={7}>
        <div className="chips">{[["all", "All"], ["expense", "Spending"], ["income", "Income"]].map(([k, l]) => <button key={k} className={"chip" + (flt === k ? " on" : "")} onClick={() => setFlt(k)}>{l}</button>)}</div>
        {all.map((r, i) => (
          <div className="erow" key={r.id} style={{ "--i": i }}>
            <i style={{ background: r.t === "income" ? "#37d67a" : catColor(s, r.cat) }} />
            <div><b>{r.note || r.sub || r.cat}</b><span>{r.cat}{r.sub ? " › " + r.sub : ""} · {r.acct || "No account"} · {dl(r.date)}</span></div>
            <strong className={r.t === "income" ? "pos" : ""}>{r.t === "income" ? "+" : "−"}{CUR}{r.amt}</strong>
            <button className="x" onClick={() => (r.t === "income" ? a.del("incomes", r.id) : a.delExp(r.id))} aria-label="Delete entry"><Ic d={I.x} s={15} /></button>
          </div>
        ))}
        {!all.length && <p className="empty">No entries yet.</p>}
      </Card>
    </div>
  );
}
