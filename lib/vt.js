import { flushSync } from "react-dom";
// Smooth view transition for tab changes, theme changes and lock/unlock (falls back to a plain update)
export function vt(fn, nav) {
  const d = document.documentElement;
  if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { fn(); return; }
  if (nav) d.classList.add("vt-nav");
  const t = document.startViewTransition(() => flushSync(fn));
  t.finished.finally(() => d.classList.remove("vt-nav"));
}
