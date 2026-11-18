"use client";
// Locks the app after inactivity, and when the tab/app has been in the background for over a minute.
import { useEffect, useRef } from "react";
export function useAutoLock(on, minutes, lock) {
  const ref = useRef(lock); ref.current = lock;
  useEffect(() => {
    if (!on) return;
    let t, hiddenAt = 0;
    const arm = () => { clearTimeout(t); t = setTimeout(() => ref.current(), Math.max(1, minutes) * 60000); };
    const vis = () => { if (document.hidden) hiddenAt = Date.now(); else if (hiddenAt && Date.now() - hiddenAt > 60000) ref.current(); };
    const ev = ["pointerdown", "keydown", "touchstart", "scroll"];
    arm(); ev.forEach((e) => window.addEventListener(e, arm, { passive: true })); document.addEventListener("visibilitychange", vis);
    return () => { clearTimeout(t); ev.forEach((e) => window.removeEventListener(e, arm)); document.removeEventListener("visibilitychange", vis); };
  }, [on, minutes]);
}
