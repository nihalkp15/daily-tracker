// Exercise library (main muscles m, secondary s), muscle names and the default weekly plan.
export const MUSCLES = { chest: "Chest", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps", forearms: "Forearms", abs: "Abs", obliques: "Obliques", traps: "Traps", lats: "Lats", upperback: "Upper back", lowerback: "Lower back", glutes: "Glutes", quads: "Quads", hamstrings: "Hamstrings", calves: "Calves" };
export const DAYKEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export const DAYS = [["mon", "Monday"], ["tue", "Tuesday"], ["wed", "Wednesday"], ["thu", "Thursday"], ["fri", "Friday"], ["sat", "Saturday"], ["sun", "Sunday"]];
const e = (m, s = []) => ({ m, s });
export const EX = {
  "Bench press": e(["chest"], ["shoulders", "triceps"]), "Incline dumbbell press": e(["chest"], ["shoulders", "triceps"]), "Chest fly": e(["chest"], ["shoulders"]), "Push-up": e(["chest"], ["shoulders", "triceps", "abs"]), "Dips": e(["chest", "triceps"], ["shoulders"]),
  "Overhead press": e(["shoulders"], ["triceps", "traps"]), "Shoulder press": e(["shoulders"], ["triceps", "traps"]), "Lateral raise": e(["shoulders"]), "Face pull": e(["shoulders", "upperback"], ["traps"]),
  "Triceps pushdown": e(["triceps"]), "Skull crusher": e(["triceps"]), "Biceps curl": e(["biceps"], ["forearms"]), "Hammer curl": e(["biceps", "forearms"]), "Wrist curl": e(["forearms"]),
  "Pull-up": e(["lats"], ["biceps", "upperback"]), "Lat pulldown": e(["lats"], ["biceps"]), "Barbell row": e(["upperback", "lats"], ["biceps", "lowerback"]), "Row": e(["upperback", "lats"], ["biceps", "lowerback"]), "Seated cable row": e(["upperback", "lats"], ["biceps"]), "Shrug": e(["traps"], ["forearms"]),
  "Squat": e(["quads", "glutes"], ["hamstrings", "lowerback", "abs"]), "Leg press": e(["quads"], ["glutes"]), "Leg extension": e(["quads"]), "Lunges": e(["quads", "glutes"], ["hamstrings"]),
  "Romanian deadlift": e(["hamstrings", "glutes"], ["lowerback"]), "Deadlift": e(["hamstrings", "glutes", "lowerback"], ["traps", "upperback", "forearms", "quads"]), "Leg curl": e(["hamstrings"]), "Hip thrust": e(["glutes"], ["hamstrings"]), "Calf raise": e(["calves"]),
  "Plank": e(["abs"], ["obliques", "lowerback"]), "Hanging leg raise": e(["abs"], ["obliques"]), "Cable crunch": e(["abs"]), "Russian twist": e(["obliques"], ["abs"]),
};
const x = (ex, sets, reps) => ({ ex, sets, reps, kg: 0 });
export const defaultPlan = () => ({
  week: { mon: "upperA", tue: "lowerA", wed: "rest", thu: "upperB", fri: "lowerB", sat: "rest", sun: "rest" },
  workouts: {
    upperA: { name: "Upper A", exercises: [x("Bench press", 4, 8), x("Barbell row", 4, 8), x("Overhead press", 3, 10), x("Lat pulldown", 3, 10), x("Biceps curl", 3, 12), x("Triceps pushdown", 3, 12)] },
    upperB: { name: "Upper B", exercises: [x("Incline dumbbell press", 4, 10), x("Pull-up", 4, 8), x("Lateral raise", 3, 15), x("Seated cable row", 3, 10), x("Hammer curl", 3, 12), x("Skull crusher", 3, 12)] },
    lowerA: { name: "Lower A", exercises: [x("Squat", 4, 8), x("Romanian deadlift", 3, 10), x("Leg press", 3, 12), x("Leg curl", 3, 12), x("Calf raise", 4, 15), x("Cable crunch", 3, 15)] },
    lowerB: { name: "Lower B", exercises: [x("Deadlift", 3, 5), x("Lunges", 3, 12), x("Hip thrust", 3, 10), x("Leg extension", 3, 12), x("Calf raise", 4, 15), x("Hanging leg raise", 3, 12)] },
  },
});
