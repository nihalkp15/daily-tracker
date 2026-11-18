// To add a tab: create components/YourModule.js and add one line below.
import { I } from "./ui";
import Dashboard from "./Dashboard";
import Tasks from "./Tasks";
import Money from "./Money";
import Health from "./Health";
import Log from "./Log";

export const MODULES = [
  { id: "dashboard", label: "Dashboard", icon: I.grid, View: Dashboard },
  { id: "tasks", label: "Tasks", icon: I.check, View: Tasks },
  { id: "money", label: "Money", icon: I.wallet, View: Money },
  { id: "health", label: "Health", icon: I.heart, View: Health },
  { id: "log", label: "Daily log", icon: I.pulse, View: Log },
];
