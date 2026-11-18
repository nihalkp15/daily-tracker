// Weekly / monthly items: period boundaries and progress counting. Weeks start on Monday.
import { iso } from "./config";
export const weekStart = (d) => { const x = new Date(d + "T12:00"); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return iso(x); };
export const monthStart = (d) => d.slice(0, 7) + "-01";
export const startOf = (period, d) => (period === "week" ? weekStart(d) : monthStart(d));
export function daysLeft(period, d) {
  const x = new Date(d + "T12:00");
  if (period === "week") return 6 - ((x.getDay() + 6) % 7);
  return new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate() - x.getDate();
}
export const doneCount = (s, item, d) => { const st = startOf(item.period, d); return s.pLog.filter((e) => e.item === item.id && e.date >= st && e.date <= d).length; };
export function resetText(period, d) {
  if (period === "week") return "resets Monday";
  const x = new Date(d + "T12:00"); return "resets " + new Date(x.getFullYear(), x.getMonth() + 1, 1).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
