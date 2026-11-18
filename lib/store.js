"use client";
// All data access lives here. Data is plain localStorage for now (dummy data only).
// Swap this file for Supabase later without touching the UI. The PIN is an app-lock gate only (see SECURITY.md).
import { useCallback, useEffect, useState } from "react";
import { ago, defaultMoney } from "./config";
import { defaultPlan } from "./exercises";
import { ITER, hasCrypto, hashPin, randSalt, same } from "./crypto";
import { vt } from "./vt";

const KEY = "daytrack.v2", PIN = "daytrack.pin", FAIL = "daytrack.fail";
const uid = () => Math.random().toString(36).slice(2, 9);
const clone = (o) => JSON.parse(JSON.stringify(o));
const EMPTY = { routines: [], routineLog: {}, meds: [], medLog: {}, appts: [], vitals: [], gym: [], incomes: [], periodic: [], pLog: [] };
const DEFAULTS = () => ({ plan: defaultPlan(), customEx: {}, sess: {}, theme: "ember", money: defaultMoney(), autoLock: 5 });

function seedCore() {
  const T = ago(0), M = defaultMoney(), cats = M.cats.expense, accts = M.accounts.map((x) => x.name), expenses = [], logs = {};
  for (let i = 13; i >= 0; i--) {
    const d = ago(i), c = cats[i % 5];
    expenses.push({ id: uid(), date: d, amt: 120 + (i * 83) % 380, cat: c.name, sub: c.subs[0] || "", acct: accts[i % 3], note: ["Lunch", "Cab", "Shirt", "Bill", "Movie"][i % 5] });
    if (i % 3 === 0) expenses.push({ id: uid(), date: d, amt: 60 + (i * 29) % 90, cat: "Food", sub: "Coffee", acct: "Cash", note: "Coffee" });
    logs[d] = { sleep: +(7 + Math.sin(i) * 1.2).toFixed(1), workout: [0, 30, 45, 60, 40][i % 5], focus: +(4 + Math.cos(i * .7) * 2).toFixed(1), mood: 1 + (i * 3) % 5 };
  }
  const t = (text, list, due = "", done = false) => ({ id: uid(), text, list, due, done });
  return { demo: true, photo: "", expenses, logs, tasks: [t("Buy apparels", "Buy", T), t("Call the bank", "Home", T), t("Finish weekly report", "Work", ago(-2)), t("Buy groceries", "Buy", "", true), t("Book dentist", "Personal")] };
}
function seedHealth() {
  const R = [{ id: uid(), text: "Wake up", time: "08:00" }, { id: uid(), text: "Drink water", target: 3, unit: "L" }, { id: uid(), text: "Take supplements" }, { id: uid(), text: "Walk", target: 20, unit: "min" }];
  const M = [{ id: uid(), name: "Vitamin D", dose: "1 tablet", time: "09:00" }, { id: uid(), name: "Omega-3", dose: "2 capsules", time: "13:00" }];
  const routineLog = {}, medLog = {};
  for (let i = 1; i <= 6; i++) {
    const d = ago(i); routineLog[d] = {}; medLog[d] = {};
    R.forEach((r, j) => { if ((i + j) % 4) routineLog[d][r.id] = r.target || 1; });
    M.forEach((m, j) => { if ((i + j) % 5) medLog[d][m.id] = 1; });
  }
  const gym = [[1, "Bench press", 3, 10, 40], [1, "Squat", 4, 8, 60], [3, "Deadlift", 3, 5, 80], [3, "Barbell row", 3, 10, 35], [5, "Bench press", 3, 10, 37.5], [6, "Squat", 4, 8, 57.5], [2, "Overhead press", 3, 10, 25]].map(([i, ex, sets, reps, kg]) => ({ id: uid(), date: ago(i), ex, sets, reps, kg }));
  return { routines: R, routineLog, meds: M, medLog, gym,
    appts: [{ id: uid(), title: "Dental check-up", date: ago(-5), note: "Bring previous reports" }],
    vitals: [0, 1, 2, 3, 4, 5].map((i) => ({ id: uid(), date: ago((5 - i) * 3), weight: +(72.4 - i * .3).toFixed(1), sys: 118 + (i % 3) * 2, dia: 78 + (i % 2) * 2 })) };
}
function seedExtra() {
  const incomes = [];
  for (let i = 13; i >= 0; i--) incomes.push({ id: uid(), date: ago(i), amt: 900 + (i * 131) % 700, cat: "Daily deposits", sub: i % 2 ? "Cash" : "Card settlements", acct: i % 2 ? "Cash" : "Bank", note: "" });
  incomes.push({ id: uid(), date: ago(5), amt: 420, cat: "Savings", sub: "Interest", acct: "Bank", note: "" });
  const P = (name, period, kind, count) => ({ id: uid(), name, period, kind, count });
  const periodic = [P("Pant", "month", "buy", 1), P("Shirt", "month", "buy", 1), P("T-shirt", "month", "buy", 2), P("PC part or earphones", "month", "buy", 1), P("Dress", "week", "buy", 2), P("Meal prep", "week", "do", 1), P("Laundry", "week", "do", 1), P("Groceries run", "week", "do", 1)];
  return { incomes, periodic, pLog: [{ id: uid(), item: periodic[2].id, date: ago(0) }, { id: uid(), item: periodic[4].id, date: ago(0) }, { id: uid(), item: periodic[5].id, date: ago(0) }] };
}
const fresh = () => ({ ...DEFAULTS(), ...seedCore(), ...seedHealth(), ...seedExtra() });
const legacy = (st) => ({ ...DEFAULTS(), ...(st.demo ? { ...seedHealth(), ...seedExtra() } : EMPTY), ...st });

// --- failed-attempt throttle (UI level; the real brake is the PBKDF2 cost) ---
const readFail = () => { try { return JSON.parse(localStorage.getItem(FAIL) || "{}"); } catch { return {}; } };
const waitLeft = () => Math.max(0, Math.ceil(((readFail().until || 0) - Date.now()) / 1000));
function noteFail() {
  const n = (readFail().n || 0) + 1, sec = n < 5 ? 0 : [30, 60, 300, 900, 3600][Math.min(n - 5, 4)];
  try { localStorage.setItem(FAIL, JSON.stringify({ n, until: sec ? Date.now() + sec * 1000 : 0 })); } catch {}
  return { ok: false, left: Math.max(0, 5 - n), wait: sec };
}
const readPin = () => { try { return JSON.parse(localStorage.getItem(PIN)); } catch { return null; } };

export function useStore() {
  const [s, setS] = useState(null), [phase, setPhase] = useState("boot");
  useEffect(() => {
    try { const st = JSON.parse(localStorage.getItem(KEY) || "null"); setS(st ? legacy(st) : fresh()); } catch { setS(fresh()); }
    setPhase(readPin() ? "locked" : "setup");
  }, []);
  const up = useCallback((fn) => setS((p) => { const n = fn(p); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} return n; }), []);

  const auth = {
    phase, hasCrypto: hasCrypto(), waitLeft,
    async create(pin) {
      const salt = randSalt(), hash = await hashPin(pin, salt);
      try { localStorage.setItem(PIN, JSON.stringify({ salt, iter: ITER, hash })); localStorage.removeItem(FAIL); } catch {}
      vt(() => setPhase("open"));
    },
    async unlock(pin) {
      if (waitLeft() > 0) return { ok: false, wait: waitLeft() };
      const r = readPin(); if (!r) { setPhase("setup"); return { ok: false }; }
      if (same(await hashPin(pin, r.salt, r.iter), r.hash)) { try { localStorage.removeItem(FAIL); } catch {} vt(() => setPhase("open")); return { ok: true }; }
      return noteFail();
    },
    async lock() { vt(() => setPhase("locked")); },
    async change(oldPin, newPin) {
      const r = readPin(); if (!r || !same(await hashPin(oldPin, r.salt, r.iter), r.hash)) return false;
      const salt = randSalt(); try { localStorage.setItem(PIN, JSON.stringify({ salt, iter: ITER, hash: await hashPin(newPin, salt) })); } catch {} return true;
    },
    reset() { try { localStorage.removeItem(PIN); localStorage.removeItem(FAIL); } catch {} setPhase("setup"); }, // forgot PIN: resets the PIN only
  };

  return [s, {
    // generic list helpers: add("routines", {...}), patch("meds", id, {...}), del("gym", id), setLog("routineLog", date, id, value)
    add: (k, item) => up((p) => ({ ...p, [k]: [{ id: uid(), ...item }, ...p[k]] })),
    patch: (k, id, v) => up((p) => ({ ...p, [k]: p[k].map((x) => (x.id === id ? { ...x, ...v } : x)) })),
    del: (k, id) => up((p) => ({ ...p, [k]: p[k].filter((x) => x.id !== id) })),
    setLog: (k, date, id, val) => up((p) => ({ ...p, [k]: { ...p[k], [date]: { ...(p[k][date] || {}), [id]: val } } })),
    // money categories and accounts: money((m) => { m.cats.expense.push(...); return m; })
    money: (fn) => up((p) => ({ ...p, money: fn(clone(p.money)) })),
    // gym plan, custom exercises, today's session, theme, auto-lock minutes
    plan: (fn) => up((p) => ({ ...p, plan: fn(p.plan) })),
    addEx: (name, m) => up((p) => ({ ...p, customEx: { ...p.customEx, [name]: { m, s: [] } } })),
    sess: (date, v) => up((p) => ({ ...p, sess: { ...p.sess, [date]: { ...(p.sess[date] || {}), ...v } } })),
    setTheme: (theme) => up((p) => ({ ...p, theme })),
    setAuto: (autoLock) => up((p) => ({ ...p, autoLock })),
    // tasks, expenses, daily log, photo
    addTask: (t) => up((p) => ({ ...p, tasks: [{ id: uid(), done: false, ...t }, ...p.tasks] })),
    toggle: (id) => up((p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
    delTask: (id) => up((p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== id) })),
    addExp: (e) => up((p) => ({ ...p, expenses: [{ id: uid(), ...e }, ...p.expenses] })),
    delExp: (id) => up((p) => ({ ...p, expenses: p.expenses.filter((e) => e.id !== id) })),
    saveLog: (d, v) => up((p) => ({ ...p, logs: { ...p.logs, [d]: v } })),
    setPhoto: (photo) => up((p) => ({ ...p, photo })),
    clearDemo: () => up((p) => ({ demo: false, photo: p.photo, theme: p.theme, autoLock: p.autoLock, plan: p.plan, customEx: p.customEx, money: p.money, sess: {}, tasks: [], expenses: [], logs: {}, ...EMPTY })),
  }, auth];
}
