"use client";
// Index page: app shell only (lock screen, sidebar, header, photo, tab transitions). Each tab lives in components/.
import { useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";
import { useAutoLock } from "../lib/useAutoLock";
import { loggingStreak } from "../lib/streak";
import { Ic, I, vt } from "../components/ui";
import { MODULES } from "../components/modules";
import LockScreen from "../components/LockScreen";
import { withBase } from "../lib/base";

export default function Page() {
  const [s, a, auth] = useStore(), [v, setV] = useState("dashboard"), [sub, setSub] = useState(null), file = useRef(null);
  const open = auth.phase === "open" && !!s;
  useEffect(() => { try { const t = localStorage.getItem("daytrack.theme"); if (t) document.documentElement.dataset.theme = t; } catch {} }, []);
  useEffect(() => { if (s?.theme) { document.documentElement.dataset.theme = s.theme; try { localStorage.setItem("daytrack.theme", s.theme); } catch {} } }, [s?.theme]);
  useAutoLock(open, s?.autoLock || 5, auth.lock);
  if (auth.phase === "boot" || !s) return <div className="stage" />;
  if (!open) return <LockScreen auth={auth} />;

  const idx = MODULES.findIndex((m) => m.id === v), cur = MODULES[idx], View = cur.View, photo = s.photo || withBase("/photo.jpg"), st = loggingStreak(s);
  const nav = (to) => { const [m, sb] = to.split(":"); vt(() => { setV(m); setSub(sb || null); window.scrollTo(0, 0); }, true); };
  // Photos are resized and re-encoded in the browser: keeps storage small and strips EXIF metadata such as GPS.
  const onPhoto = (ev) => {
    const f = ev.target.files?.[0]; ev.target.value = "";
    if (!f || !f.type.startsWith("image/") || f.size > 15e6) return;
    const url = URL.createObjectURL(f), img = new Image();
    img.onload = () => { const k = Math.min(1, 640 / Math.max(img.width, img.height)), c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); a.setPhoto(c.toDataURL("image/jpeg", .82)); URL.revokeObjectURL(url); };
    img.onerror = () => URL.revokeObjectURL(url); img.src = url;
  };
  const pick = () => file.current.click();
  const h = new Date().getHours(), hello = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="stage">
      <div className="bg"><i /><i /></div>
      <div className="frame">
        <aside className="side">
          <div className="logo"><Ic d={I.spark} s={22} /></div>
          <nav style={{ "--idx": idx }}><i className="navpill" />{MODULES.map((m) => <button key={m.id} data-tip={m.label} className={v === m.id ? "on" : ""} onClick={() => nav(m.id)} aria-label={m.label}><Ic d={m.icon} /></button>)}</nav>
        </aside>
        <section className="content">
          <header>
            <div><h1>{v === "dashboard" ? hello : cur.label}</h1><small>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}{st > 0 && <span className="stk sm">🔥 {st}-day streak</span>}</small></div>
            <div className="hi">
              {s.demo && <button className="pill" onClick={() => confirm("Remove the demo data and start fresh?") && a.clearDemo()}>Demo data · Clear</button>}
              <button className="ibtn" onClick={() => auth.lock()} aria-label="Lock app"><Ic d={I.lock} s={18} /></button>
              <button className="av" onClick={pick} aria-label="Change photo"><img src={photo} alt="" /></button>
              <input ref={file} type="file" accept="image/*" hidden onChange={onPhoto} />
            </div>
          </header>
          <div key={v} className="pg"><View s={s} a={a} go={nav} pick={pick} sub={sub} auth={auth} /></div>
        </section>
      </div>
    </div>
  );
}
