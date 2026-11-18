"use client";
// Small dashboard cards: today's workout and today's routine.
import { Card, Ic, I } from "./ui";
import BodyMap from "./BodyMap";
import { ago } from "../lib/config";
import { sum } from "../lib/helpers";
import { todayWorkout, workoutLevels, weekLevels } from "../lib/gymtools";
import { doneCount, daysLeft } from "../lib/periodic";

export function TodayMini({ s, go, i }) {
  const { W } = todayWorkout(s), ss = s.sess[ago(0)] || {}, done = ss.done || {};
  const total = W ? sum(W.exercises.map((e) => e.sets)) : 0, dn = W ? sum(W.exercises.map((e, k) => Math.min(e.sets, done[k] || 0))) : 0, pct = total ? Math.round(dn / total * 100) : 0;
  return (
    <Card className="s4" i={i}>
      <div className="ch"><h3>{W ? "Today’s workout" : "Rest day · this week’s load"}</h3><button className="link" onClick={() => go("health:gym")}>Open</button></div>
      {W && <div className="hl"><b>{W.name}</b><span>{ss.fin ? "Done ✓" : dn + "/" + total + " sets"}</span></div>}
      <BodyMap theme={s.theme} compact levels={W ? workoutLevels(s, W, done) : weekLevels(s)} />
      {W && <div className="bar"><i style={{ width: pct + "%" }} /></div>}
    </Card>
  );
}

export function RoutineMini({ s, a, go, i }) {
  const T = ago(0), val = (r) => s.routineLog[T]?.[r.id] || 0, ok = (r) => val(r) >= (r.target || 1), n = s.routines.filter(ok).length;
  const bump = (r) => a.setLog("routineLog", T, r.id, r.target ? (ok(r) ? 0 : Math.min(r.target, +(val(r) + (r.target <= 5 ? .5 : 1)).toFixed(1))) : (val(r) ? 0 : 1));
  return (
    <Card className="s4" i={i}>
      <div className="ch"><h3>Today’s routine</h3><button className="link" onClick={() => go("tasks")}>Open</button></div>
      {s.routines.length > 0 && <div className="rsum"><span><b>{n}/{s.routines.length}</b> done</span><div className="bar"><i style={{ width: n / s.routines.length * 100 + "%" }} /></div></div>}
      {s.routines.slice(0, 4).map((r, k) => (
        <div className={"trow" + (ok(r) ? " done" : "")} key={r.id} style={{ "--i": k }}>
          <button className="chk" onClick={() => bump(r)} aria-label={"Update " + r.text}><Ic d={I.check} s={14} /></button>
          <div><b>{r.text}</b>{r.target ? <span>{val(r)}/{r.target} {r.unit}</span> : null}</div>
        </div>
      ))}
      {!s.routines.length && <p className="empty">Add daily actions in Tasks.</p>}
    </Card>
  );
}

export function PeriodicMini({ s, go, i }) {
  const T = ago(0), items = s.periodic.map((r) => ({ r, n: doneCount(s, r, T), left: daysLeft(r.period, T) }));
  const need = sum(items.map((x) => x.r.count)), got = sum(items.map((x) => Math.min(x.n, x.r.count)));
  const todo = items.filter((x) => x.n < x.r.count).sort((p, q) => p.left - q.left).slice(0, 4);
  return (
    <Card className="s4" i={i}>
      <div className="ch"><h3>Monthly and weekly</h3><button className="link" onClick={() => go("tasks")}>Open</button></div>
      {need > 0 && <div className="rsum"><span><b>{got}/{need}</b> done</span><div className="bar"><i style={{ width: got / need * 100 + "%" }} /></div></div>}
      {todo.map(({ r, n, left }) => (
        <div className="erow" key={r.id}><i style={{ background: left <= 2 ? "var(--ac)" : "#ffffff44" }} /><div><b>{r.name}</b><span>{r.kind === "buy" ? "Buy" : "Do"} · {n}/{r.count} · {left}d left this {r.period}</span></div></div>
      ))}
      {need > 0 && !todo.length && <p className="empty">All done for now. Nice.</p>}
      {!need && <p className="empty">Add items in Tasks.</p>}
    </Card>
  );
}
