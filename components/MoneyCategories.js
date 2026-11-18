"use client";
// Manage your own expense categories, income categories (with sub-categories) and accounts such as Cash.
import { useState } from "react";
import { Card, Ic, I } from "./ui";
import { CUR } from "../lib/config";

const PALETTE = ["#ff9a3d", "#5a8dff", "#ff5aa5", "#37d67a", "#d9c94a", "#a78bfa", "#22d3ee", "#fb7185"];

function AddOne({ label, onAdd }) {
  const [v, setV] = useState("");
  return <form className="subadd" onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onAdd(v.trim()); setV(""); } }}><input aria-label={label} placeholder={label} value={v} onChange={(e) => setV(e.target.value)} /></form>;
}

export default function MoneyCategories({ s, a }) {
  const { cats, accounts } = s.money, upd = (fn) => a.money((m) => fn(m));
  const [na, setNa] = useState({ name: "", opening: "" });
  const addCat = (t, name) => upd((m) => { if (!m.cats[t].some((c) => c.name.toLowerCase() === name.toLowerCase())) m.cats[t].push(t === "expense" ? { name, color: PALETTE[m.cats.expense.length % PALETTE.length], subs: [] } : { name, subs: [] }); return m; });
  const delCat = (t, name) => upd((m) => { m.cats[t] = m.cats[t].filter((c) => c.name !== name); return m; });
  const addSub = (t, name, sub) => upd((m) => { const c = m.cats[t].find((x) => x.name === name); if (c && !c.subs.includes(sub)) c.subs.push(sub); return m; });
  const delSub = (t, name, sub) => upd((m) => { const c = m.cats[t].find((x) => x.name === name); if (c) c.subs = c.subs.filter((x) => x !== sub); return m; });
  const color = (name, v) => upd((m) => { const c = m.cats.expense.find((x) => x.name === name); if (c) c.color = v; return m; });
  const addAcct = (e) => { e.preventDefault(); const n = na.name.trim(); if (!n) return; upd((m) => { if (!m.accounts.some((x) => x.name.toLowerCase() === n.toLowerCase())) m.accounts.push({ name: n, opening: Number(na.opening) || 0 }); return m; }); setNa({ name: "", opening: "" }); };
  const section = (t, title, i) => (
    <Card className="s6" i={i} key={t}>
      <h3>{title}</h3>
      {cats[t].map((c) => (
        <div className="catb" key={c.name}>
          <div className="cath">
            {t === "expense" && <input type="color" aria-label={c.name + " colour"} value={c.color} onChange={(e) => color(c.name, e.target.value)} />}
            <b>{c.name}</b>
            <button className="x" onClick={() => delCat(t, c.name)} aria-label={"Delete " + c.name}><Ic d={I.x} s={15} /></button>
          </div>
          <div className="subs">{c.subs.map((x) => <span key={x}>{x}<button onClick={() => delSub(t, c.name, x)} aria-label={"Remove " + x}>×</button></span>)}<AddOne label="+ sub-category" onAdd={(v) => addSub(t, c.name, v)} /></div>
        </div>
      ))}
      <div style={{ marginTop: 12 }}><AddOne label={"+ new " + t + " category"} onAdd={(v) => addCat(t, v)} /></div>
      <p className="mu" style={{ fontSize: 11, marginTop: 10 }}>Past entries keep their old category if you delete one.</p>
    </Card>
  );
  return (
    <div className="g">
      {section("expense", "Expense categories", 0)}
      {section("income", "Income categories", 1)}
      <Card className="s12" i={2}>
        <h3>Accounts (cash, bank, cards)</h3>
        {accounts.map((x) => (
          <div className="acct" key={x.name}><b>{x.name}</b><label className="kg">Opening {CUR}<input type="number" step="0.01" aria-label={x.name + " opening balance"} value={x.opening || ""} onChange={(e) => upd((m) => { m.accounts.find((y) => y.name === x.name).opening = Number(e.target.value) || 0; return m; })} /></label><button className="x" onClick={() => upd((m) => { m.accounts = m.accounts.filter((y) => y.name !== x.name); return m; })} aria-label={"Delete " + x.name}><Ic d={I.x} s={15} /></button></div>
        ))}
        <form className="mform" onSubmit={addAcct}>
          <input aria-label="Account name" placeholder="New account, e.g. UPI" value={na.name} onChange={(e) => setNa({ ...na, name: e.target.value })} />
          <input type="number" aria-label="Opening balance" placeholder="Opening balance" value={na.opening} onChange={(e) => setNa({ ...na, opening: e.target.value })} />
          <span /><button className="white" aria-label="Add account"><Ic d={I.plus} s={16} /></button>
        </form>
      </Card>
    </div>
  );
}
