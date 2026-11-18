"use client";
import { withBase } from "../lib/base";
import { Card, CountUp, LineChart, Ic, I } from "./ui";
import { ago, CUR } from "../lib/config";
import { days, sum, spendOn, dl, catColor } from "../lib/helpers";
import TaskRow from "./TaskRow";
import { TodayMini, RoutineMini, PeriodicMini } from "./DashCards";
import ThemePicker from "./ThemePicker";
import SecurityCard from "./SecurityCard";

export default function Dashboard({ s, a, go, pick, auth }) {
  const D = days(14), W = D.slice(7), mo = ago(0).slice(0, 7), lg = (d) => s.logs[d] || {};
  const sp = D.map((d) => spendOn(s.expenses, d)), open = s.tasks.filter((t) => !t.done);
  const month = sum(s.expenses.filter((e) => e.date.startsWith(mo)).map((e) => e.amt));
  const t = lg(ago(0)), pc = (v, g) => Math.min(1, (v || 0) / g);
  const score = Math.round((pc(t.sleep, 8) + pc(t.workout, 45) + pc(t.focus, 6)) / 3 * 100);
  const nextUp = [...open].sort((x, y) => (x.due || "9").localeCompare(y.due || "9")).slice(0, 4);
  const photo = s.photo || withBase("/photo.jpg");
  const stats = [[open.length, 0, "", "Open tasks", "#5a8dff"], [month, 0, CUR, "Spent this month", "#ff6a3d"], [sum(W.map((d) => lg(d).sleep || 0)) / 7, 1, "", "Avg sleep (h)", "#37d67a"], [sum(W.map((d) => lg(d).focus || 0)), 0, "", "Focus hrs / wk", "#ff5aa5"]];
  return (
    <div className="g">
      <Card className="hero s7" i={0}>
        <div className="copy"><small>Your day at a glance</small><h2>Optimize<br />Your Day</h2><button className="white" onClick={() => go("tasks")}>Open tasks</button></div>
        <img className="photo" src={photo} alt="Profile" />
        <button className="swap" onClick={pick}><Ic d={I.cam} s={15} /> Change photo</button>
        <div className="stats">
          {stats.map(([v, d, p, l, c]) => <div key={l}><b><CountUp value={v} dec={d} prefix={p} /></b><span><i style={{ background: c }} />{l}</span></div>)}
          <button className="go" onClick={() => go("log")} aria-label="Open daily log"><Ic d={I.next} s={16} /></button>
        </div>
      </Card>
      <Card className="s5" i={1}><h3>Spending, last 14 days</h3><LineChart id="d" vals={sp} labels={D.map((d) => dl(d))} unit={CUR} /></Card>
      <TodayMini s={s} go={go} i={2} />
      <Card className="s4" i={3}>
        <div className="ch"><h3>Up next</h3><button className="link" onClick={() => go("tasks")}>All</button></div>
        {nextUp.length ? nextUp.map((x, i) => <TaskRow key={x.id} t={x} a={a} i={i} />) : <p className="empty">Nothing open. Enjoy the quiet.</p>}
      </Card>
      <Card className="s4 ringcard" i={4}>
        <h3>Today’s habit score</h3>
        <div className="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff1a" strokeWidth="9" /><circle className="arc" cx="50" cy="50" r="42" fill="none" stroke="url(#rg)" strokeWidth="9" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={264 * (1 - score / 100)} /><defs><linearGradient id="rg"><stop offset="0" style={{ stopColor: "var(--ac)" }} /><stop offset="1" style={{ stopColor: "var(--ac2)" }} /></linearGradient></defs></svg><b>{t.sleep != null || t.focus != null ? <CountUp value={score} /> : "–"}</b></div>
        <button className="link" onClick={() => go("log")}>{t.sleep != null ? "Edit today’s log" : "Log today"}</button>
      </Card>
      <RoutineMini s={s} a={a} go={go} i={5} />
      <PeriodicMini s={s} go={go} i={6} />
      <Card className="s4" i={7}>
        <div className="ch"><h3>Recent spending</h3><button className="link" onClick={() => go("money")}>All</button></div>
        {s.expenses.slice().sort((x, y) => y.date.localeCompare(x.date)).slice(0, 4).map((e) => (
          <div className="erow" key={e.id}><i style={{ background: catColor(s, e.cat) }} /><div><b>{e.note || e.cat}</b><span>{e.cat}{e.sub ? " › " + e.sub : ""} · {dl(e.date)}</span></div><strong>{CUR}{e.amt}</strong></div>
        ))}
        {!s.expenses.length && <p className="empty">No expenses yet.</p>}
      </Card>
      <ThemePicker s={s} a={a} i={8} cls="s4" />
      <SecurityCard s={s} a={a} auth={auth} i={9} cls="s8" />
    </div>
  );
}
