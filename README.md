# Daily Tracker (Next.js)
npm install
npm run dev      -> http://localhost:3000
npm run build    -> static site in /out

Deploy to GitHub Pages (free):
1. Create a new GitHub repo (e.g. daily-tracker), public.
2. In this folder: git init, git add ., git commit -m "first version", git branch -M main,
   git remote add origin https://github.com/<you>/daily-tracker.git, git push -u origin main
3. Repo > Settings > Pages > Source: GitHub Actions.
4. Wait for the Actions run (Actions tab). Site: https://<you>.github.io/daily-tracker/
5. On your phone: open the link > browser menu > Add to Home screen.
Updates: replace changed files, commit, push. The site rebuilds itself.

Tabs: Dashboard, Tasks (routine, monthly/weekly items), Money (spending, income, categories, accounts),
Health (Medical, Gym: Today / Plan / History), Daily log.

app/page.js              index shell (lock screen, sidebar, header)
components/modules.js    tab registry: add a tab = one line
components/              one file per tab/feature (Money*, Gym*, Periodic, Routines, LockScreen, SecurityCard...)
components/BodyMap.js    muscle map (library); BodyMapSimple.js = hand-drawn fallback (rename to switch back)
lib/config.js            currency, PIN length, task lists, default money categories
lib/store.js             all data access (localStorage now; swap for Supabase later)
styles/                  themes, base, components, modules, responsive (keep responsive last)
SECURITY.md              everything done for security, limits, and the Supabase checklist
