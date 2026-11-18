import { ago } from "./config";
export const days = (n) => Array.from({ length: n }, (_, i) => ago(n - 1 - i));
export const sum = (a) => a.reduce((x, y) => x + y, 0);
export const spendOn = (E, d) => sum(E.filter((e) => e.date === d).map((e) => e.amt));
export const dl = (d) => new Date(d + "T12:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
export const due = (t) => (!t.due ? "" : t.due === ago(0) ? "Today" : t.due < ago(0) ? "Overdue" : dl(t.due));
export const num = (v) => (v === "" || v == null ? null : Number(v));
export const catColor = (s, n) => s.money.cats.expense.find((c) => c.name === n)?.color || "#8a7f78";
