// Gym helpers: today's workout, muscle levels for the body map, week strip and streak.
import { ago } from "./config";
import { EX, DAYKEYS } from "./exercises";

export const dkOf = (d) => DAYKEYS[new Date(d + "T12:00").getDay()];
export const lookup = (s) => ({ ...EX, ...(s.customEx || {}) });
export const look = (s, n) => lookup(s)[n] || { m: [], s: [] };
export const plannedId = (s, d) => s.sess[d]?.w ?? s.plan.week[dkOf(d)] ?? "rest";
export function todayWorkout(s) { const wid = plannedId(s, ago(0)); return { wid, W: wid !== "rest" ? s.plan.workouts[wid] || null : null }; }
export function lastKg(s, ex) { const g = s.gym.filter((x) => x.ex === ex && x.kg).sort((a, b) => b.date.localeCompare(a.date))[0]; return g ? g.kg : null; }

// Planned muscles glow dimly; each completed set makes them brighter (0..1)
export function workoutLevels(s, W, done) {
  const P = {}, D = {};
  W.exercises.forEach((e, i) => {
    const { m, s: sc } = look(s, e.ex), n = Math.min(e.sets, done[i] || 0);
    m.forEach((x) => { P[x] = (P[x] || 0) + e.sets; D[x] = (D[x] || 0) + n; });
    sc.forEach((x) => { P[x] = (P[x] || 0) + e.sets * .5; D[x] = (D[x] || 0) + n * .5; });
  });
  const out = {}; Object.keys(P).forEach((x) => { out[x] = .3 + .7 * D[x] / P[x]; }); return out;
}
// Muscles trained in the last 7 days from the History log
export function weekLevels(s) {
  const L = lookup(s), from = ago(6), S = {};
  s.gym.filter((g) => g.date >= from).forEach((g) => { const x = L[g.ex]; if (!x) return; x.m.forEach((k) => { S[k] = (S[k] || 0) + g.sets; }); x.s.forEach((k) => { S[k] = (S[k] || 0) + g.sets * .5; }); });
  const out = {}; Object.keys(S).forEach((k) => { out[k] = Math.min(1, S[k] / 12); }); return out;
}
export function muscleInfo(s, m) {
  const L = lookup(s), from = ago(6), ms = m === "upperback" ? ["upperback", "lats"] : [m]; let last = null, sets = 0;
  s.gym.forEach((g) => {
    const x = L[g.ex]; if (!x) return;
    const main = ms.some((k) => x.m.includes(k)), sec = ms.some((k) => x.s.includes(k)); if (!main && !sec) return;
    if (last == null || g.date > last) last = g.date;
    if (g.date >= from) sets += main ? g.sets : g.sets * .5;
  });
  return { last: last == null ? null : Math.round((new Date(ago(0) + "T12:00") - new Date(last + "T12:00")) / 864e5), sets: Math.round(sets) };
}
export function weekStrip(s) {
  const T = ago(0), dow = (new Date().getDay() + 6) % 7;
  return ["M", "T", "W", "T", "F", "S", "S"].map((l, i) => {
    const d = ago(dow - i), p = plannedId(s, d), fin = s.sess[d]?.fin, rest = !p || p === "rest";
    return { l, d, state: fin ? "done" : rest ? "rest" : d === T ? "today" : d < T ? "miss" : "up" };
  });
}
export function streak(s) {
  let n = 0;
  for (let i = 0; i < 90; i++) { const d = ago(i), p = plannedId(s, d); if (s.sess[d]?.fin) { n++; continue; } if (!p || p === "rest" || i === 0) continue; break; }
  return n;
}
