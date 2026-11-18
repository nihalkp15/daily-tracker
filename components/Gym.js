"use client";
import { useState } from "react";
import GymToday from "./GymToday";
import GymPlan from "./GymPlan";
import GymHistory from "./GymHistory";

const TABS = [["today", "Today", GymToday], ["plan", "Plan", GymPlan], ["history", "History", GymHistory]];

export default function Gym(props) {
  const [t, setT] = useState("today"), View = TABS.find((x) => x[0] === t)[2];
  return (
    <div>
      <div className="chips sub">{TABS.map(([k, l]) => <button key={k} className={"chip" + (t === k ? " on" : "")} onClick={() => setT(k)}>{l}</button>)}</div>
      <div key={t}><View {...props} /></div>
    </div>
  );
}
