"use client";
import { Card, vt } from "./ui";
import { THEMES } from "../lib/themes";

export default function ThemePicker({ s, a, i, cls = "s4" }) {
  const cur = s.theme || "ember";
  const pick = (id) => vt(() => { document.documentElement.dataset.theme = id; try { localStorage.setItem("daytrack.theme", id); } catch {} a.setTheme(id); });
  return (
    <Card className={cls} i={i}>
      <h3>Theme</h3>
      <div className="sw">{THEMES.map((t) => <button key={t.id} className={cur === t.id ? "on" : ""} onClick={() => pick(t.id)} aria-label={t.name + " theme"}><i style={{ background: `linear-gradient(135deg,${t.a},${t.b})` }} />{t.name}</button>)}</div>
    </Card>
  );
}
