"use client";
import { useState } from "react";
import MoneyOverview from "./MoneyOverview";
import MoneyCategories from "./MoneyCategories";

const TABS = [["overview", "Overview", MoneyOverview], ["cats", "Categories and accounts", MoneyCategories]];

export default function Money(props) {
  const [t, setT] = useState("overview"), View = TABS.find((x) => x[0] === t)[2];
  return (
    <div>
      <div className="chips sub">{TABS.map(([k, l]) => <button key={k} className={"chip" + (t === k ? " on" : "")} onClick={() => setT(k)}>{l}</button>)}</div>
      <div key={t}><View {...props} /></div>
    </div>
  );
}
