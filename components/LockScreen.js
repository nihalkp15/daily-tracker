"use client";
// PIN lock screen: used for first-time setup and for unlocking. Custom keypad, keyboard input, shake on error.
import { useEffect, useRef, useState } from "react";
import { Ic, I } from "./ui";
import { PIN_LENGTH as LEN } from "../lib/config";
import { isWeak } from "../lib/pin";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
const fmt = (n) => Math.floor(n / 60) + ":" + String(n % 60).padStart(2, "0");

export default function LockScreen({ auth }) {
  const setup = auth.phase === "setup";
  const [pin, setPin] = useState(""), [first, setFirst] = useState(null), [msg, setMsg] = useState(""), [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false), [wait, setWait] = useState(0), [ok, setOk] = useState(false), [forgot, setForgot] = useState(false), lock = useRef(false);

  useEffect(() => { setWait(auth.waitLeft()); }, []);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait((w) => w - 1), 1000); return () => clearTimeout(t); }, [wait]);

  const bad = (m) => { setMsg(m); setShake(true); navigator.vibrate?.(120); setPin(""); setTimeout(() => setShake(false), 500); };
  const press = (k) => {
    if (busy || wait > 0 || ok) return;
    if (k === "⌫") setPin((p) => p.slice(0, -1));
    else if (k && pin.length < LEN) { setPin((p) => p + k); setMsg(""); navigator.vibrate?.(8); }
  };
  useEffect(() => {
    const h = (e) => { if (/^\d$/.test(e.key)) press(e.key); else if (e.key === "Backspace") press("⌫"); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  });
  useEffect(() => {
    if (pin.length !== LEN || lock.current) return;
    lock.current = true; setBusy(true);
    (async () => {
      try {
        if (setup) {
          if (first === null) { if (isWeak(pin)) bad("Too easy to guess. Avoid repeats and sequences."); else { setFirst(pin); setPin(""); setMsg(""); } }
          else if (pin !== first) { bad("PINs didn’t match. Start again."); setFirst(null); }
          else { await auth.create(pin); setOk(true); }
        } else {
          const r = await auth.unlock(pin);
          if (r.ok) setOk(true); else { bad(r.wait ? "Too many attempts." : "Wrong PIN" + (r.left ? " · " + r.left + " tries before a pause" : "")); if (r.wait) setWait(r.wait); }
        }
      } catch { bad("Something went wrong. Try again."); }
      lock.current = false; setBusy(false);
    })();
  }, [pin]);

  return (
    <div className="stage lock">
      <div className="bg"><i /><i /></div>
      <div className={"lk" + (ok ? " out" : "")}>
        <div className="lkl"><Ic d={I.lock} s={24} /></div>
        <h2>{setup ? (first === null ? "Create your PIN" : "Confirm your PIN") : "Welcome back"}</h2>
        <p className="sub">{setup ? LEN + " digits. You’ll enter it whenever the app locks." : "Enter your PIN to continue"}</p>
        {!auth.hasCrypto ? <p className="lkm">The lock needs a secure page (HTTPS or localhost).</p> : (
          <>
            <div className={"dots" + (shake ? " shake" : "") + (busy ? " busy" : "") + (ok ? " ok" : "")} aria-label={pin.length + " of " + LEN + " digits entered"}>{Array.from({ length: LEN }, (_, i) => <i key={i} className={i < pin.length ? "on" : ""} />)}</div>
            <p className="lkm" role="status" aria-live="polite">{wait > 0 ? "Try again in " + fmt(wait) : msg}</p>
            <div className="pad">{KEYS.map((k, i) => k === "" ? <span key={i} /> : <button key={i} type="button" className="key" disabled={busy || wait > 0} onClick={() => press(k)} aria-label={k === "⌫" ? "Delete" : k}>{k === "⌫" ? <Ic d={I.back} s={22} /> : k}</button>)}</div>
          </>
        )}
        {!setup && !forgot && <button className="lkf" onClick={() => setForgot(true)}>Forgot PIN?</button>}
        {forgot && <div className="lkw">This resets only the PIN. Your data stays on this device. You’ll set a new PIN next.<br /><button className="danger" onClick={() => auth.reset()}>Reset PIN</button> <button className="lkf" onClick={() => setForgot(false)}>Cancel</button></div>}
      </div>
    </div>
  );
}
