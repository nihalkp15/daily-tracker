// Logging streak: consecutive days (ending today, or yesterday if today is still empty) on which anything was logged.
import { ago } from "./config";
export function activeDays(s) {
  const set = new Set(), add = (d) => d && set.add(d);
  Object.keys(s.logs).forEach(add);
  [s.expenses, s.incomes, s.gym, s.vitals, s.pLog].forEach((l) => (l || []).forEach((e) => add(e.date)));
  Object.keys(s.sess).forEach((d) => s.sess[d]?.fin && add(d));
  [s.routineLog, s.medLog].forEach((m) => Object.keys(m || {}).forEach((d) => Object.values(m[d] || {}).some((v) => v > 0) && add(d)));
  return set;
}
export function loggingStreak(s) {
  const set = activeDays(s); let n = 0, i = set.has(ago(0)) ? 0 : 1;
  while (set.has(ago(i))) { n++; i++; }
  return n;
}
