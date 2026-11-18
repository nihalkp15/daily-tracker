"use client";
import { useState } from "react";
import Medical from "./Medical";
import Gym from "./Gym";

const TABS = [["medical", "Medical", Medical], ["gym", "Gym", Gym]];

export default function Health(props) {
  const [t, setT] = useState(props.sub === "gym" ? "gym" : "medical"), View = TABS.find((x) => x[0] === t)[2];
  return (
    <div>
      <div className="chips sub">{TABS.map(([k, l]) => <button key={k} className={"chip" + (t === k ? " on" : "")} onClick={() => setT(k)}>{l}</button>)}</div>
      <div key={t}><View {...props} /></div>
    </div>
  );
}
