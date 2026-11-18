"use client";
// App lock controls: lock now, auto-lock timer, change PIN.
import { useState } from "react";
import { Card, Ic, I } from "./ui";
import { PIN_LENGTH as LEN } from "../lib/config";
import { isWeak } from "../lib/pin";

export default function SecurityCard({ s, a, auth, cls = "s8", i }) {
  const [open, setOpen] = useState(false), [f, setF] = useState({ cur: "", nw: "", cf: "" }), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const ok = (v) => new RegExp("^\\d{" + LEN + "}$").test(v), set = (k) => (e) => setF({ ...f, [k]: e.target.value.replace(/\D/g, "") });
  const submit = async (e) => {
    e.preventDefault();
    if (![f.cur, f.nw, f.cf].every(ok)) return setMsg("Use exactly " + LEN + " digits in each box.");
    if (f.nw !== f.cf) return setMsg("The new PINs don’t match.");
    if (isWeak(f.nw)) return setMsg("That PIN is too easy to guess.");
    setBusy(true); const done = await auth.change(f.cur, f.nw); setBusy(false);
    if (!done) return setMsg("Current PIN is wrong.");
    setF({ cur: "", nw: "", cf: "" }); setOpen(false); setMsg("PIN changed.");
  };
  return (
    <Card className={cls} i={i}>
      <h3>App lock</h3>
      <p className="mu" style={{ margin: "4px 0 12px", fontSize: 13 }}>Locks after {s.autoLock || 5} min of inactivity, or when the app is in the background for over a minute.</p>
      <div className="fa">
        <button className="white" onClick={() => auth.lock()}><Ic d={I.lock} s={16} /> Lock now</button>
        <button className="ghost" onClick={() => { setOpen(!open); setMsg(""); }}>Change PIN</button>
        <label className="swp">Auto-lock<select value={s.autoLock || 5} onChange={(e) => a.setAuto(Number(e.target.value))}>{[1, 5, 15, 30].map((m) => <option key={m} value={m}>{m} min</option>)}</select></label>
      </div>
      {open && (
        <form className="pinf" onSubmit={submit}>
          {[["cur", "Current PIN"], ["nw", "New PIN"], ["cf", "Confirm new"]].map(([k, l]) => <label key={k}>{l}<input type="password" inputMode="numeric" autoComplete="off" maxLength={LEN} value={f[k]} onChange={set(k)} /></label>)}
          <button className="white" disabled={busy}>Save</button>
        </form>
      )}
      {msg && <p className="mu" role="status" style={{ marginTop: 10, fontSize: 13 }}>{msg}</p>}
    </Card>
  );
}
