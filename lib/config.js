// App-wide settings. Change currency, task lists, PIN length and default money categories here.
export const CUR = "₹";
export const LISTS = ["Buy", "Work", "Home", "Personal"];
export const PIN_LENGTH = 4;
export const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
export const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };
// Starting categories. Everything here can be edited inside the app (Money > Categories).
export const defaultMoney = () => ({
  cats: {
    expense: [
      { name: "Food", color: "#ff9a3d", subs: ["Groceries", "Eating out", "Coffee"] },
      { name: "Travel", color: "#5a8dff", subs: ["Fuel", "Cab", "Tickets"] },
      { name: "Shopping", color: "#ff5aa5", subs: ["Clothes", "Devices", "Home"] },
      { name: "Bills", color: "#37d67a", subs: ["Rent", "Electricity", "Internet", "Phone"] },
      { name: "Fun", color: "#d9c94a", subs: ["Movies", "Games"] },
    ],
    income: [
      { name: "Daily deposits", subs: ["Cash", "Card settlements"] },
      { name: "Credit card", subs: [] },
      { name: "Savings", subs: ["Interest", "Transfer in"] },
      { name: "Salary", subs: [] },
    ],
  },
  accounts: [{ name: "Cash", opening: 0 }, { name: "Bank", opening: 0 }, { name: "Credit card", opening: 0 }],
});
