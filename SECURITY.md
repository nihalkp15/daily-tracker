# Security note

Written for the current stage of the app: **UI only, dummy data, stored in the browser**. Real protection for real data
is a later step (Supabase), and section 4 lists what must be done before any real data goes in.

## 1. Current state in one paragraph
The app is a static front end. It has no server and no database. The only data is dummy data kept in the visitor's own
browser (`localStorage`). Hosting it publicly exposes the app's code and nothing else. **Do not enter real medical,
financial or personal data until section 4 is complete.**

## 2. What has been done (and where)

### Hosting surface
| Measure | Detail | File |
|---|---|---|
| Static export | `output: "export"`. The build produces plain files in `out/`. No Node server runs in production, so server-side Next.js attacks (request handling, RSC, middleware) have no target. | `next.config.js` |
| Patched Next.js line | `next ^15.5.24`. Next 14 is end of support and still audits with known advisories, so it was not used. React `^19.2.0`. | `package.json` |
| No browser source maps | `productionBrowserSourceMaps: false` | `next.config.js` |
| Telemetry off | `next telemetry disable` runs before `dev` and `build` | `package.json` |
| Dependencies | Only 4 direct: next, react, react-dom, react-body-highlighter (pinned `2.0.5`). `npm run audit` runs `npm audit --omit=dev`. | `package.json` |
| `.npmrc` | `legacy-peer-deps=true`, needed only because the muscle-map library declares older React peer ranges. Remove it if the library updates. | `.npmrc` |
| Secrets | None exist. `.env*`, `node_modules`, `.next`, `out` are git-ignored. | `.gitignore` |

### Response headers (identical in both files)
Netlify and Cloudflare Pages read `public/_headers`; Vercel reads `vercel.json`. Use the one for your host.
- `Content-Security-Policy`: `default-src 'self'`; `script-src 'self' 'unsafe-inline'`; `style-src 'self' 'unsafe-inline'`;
  `img-src 'self' data: blob:`; `font-src 'self' data:`; `connect-src 'self'` (the app may only talk to its own origin);
  `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`; `upgrade-insecure-requests`.
  `'unsafe-inline'` is required by Next's inline bootstrap scripts (nonces need a server). It is acceptable here because the
  code has no `eval`, no `innerHTML` and loads no third-party scripts (verified by search, see section 5).
- `X-Frame-Options: DENY` (clickjacking), `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`.
- `Permissions-Policy`: camera, microphone, geolocation, payment, usb, interest-cohort all disabled.
- `Strict-Transport-Security: max-age=63072000` (HTTPS only; `includeSubDomains` and `preload` deliberately omitted).
- `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`.
- `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`.

### Not discoverable
`app/robots.js` disallows all crawlers; `app/layout.js` sets robots meta noindex/nofollow/nocache and `referrer: no-referrer`.

### No third-party contact
No analytics, trackers, CDNs or embeds. The font is downloaded at build time and served from your own domain
(`next/font`). `connect-src 'self'` blocks anything else in the browser. Source search found no external URLs.

### App lock (PIN)
Files: `components/LockScreen.js`, `components/SecurityCard.js`, `lib/store.js` (auth), `lib/crypto.js`, `lib/pin.js`, `lib/useAutoLock.js`.
- 4-digit PIN (change `PIN_LENGTH` in `lib/config.js` for 6 or more).
- Stored only as a hash: PBKDF2-SHA256, 600,000 iterations, random 16-byte salt per PIN; compared in constant time.
- Trivial PINs rejected: repeats (0000), sequences (1234, 4321), repeated pairs (1212).
- Throttle after 5 wrong attempts: 30 s, 1 min, 5 min, 15 min, then 1 h.
- Auto-lock after 1/5/15/30 minutes of inactivity (default 5), and when the app is in the background for over 60 s. Manual lock button in the header.
- No PIN text field is used (custom keypad), so nothing is saved by browser autofill. Requires HTTPS or localhost (Web Crypto).

### Input and uploads
- All user text is rendered through React (escaped). No `dangerouslySetInnerHTML`, `eval`, `new Function`, `innerHTML`.
- Photo upload: must be an image under 15 MB, then resized to 640 px and re-encoded as JPEG in the browser. This strips EXIF metadata such as GPS location.

## 3. Known limits (be aware)
- **The PIN is an app lock, not encryption.** Dummy data in `localStorage` is plain. Anyone with access to your unlocked browser profile, its dev tools, or a malicious extension can read or bypass it. The throttle is also client-side.
- "Forgot PIN" resets the PIN only (data is kept), so the lock is a deterrent against casual access, not a security boundary.
- A 4-digit PIN has 10,000 combinations. That is fine for a lock screen, never fine as the only protection for a server-side account.
- `public/photo.jpg` is a third-party reference image. It is served publicly; delete or replace it before hosting.
- Nothing here has been tested on a live host from this environment: build, headers and the muscle-map library must be checked after your first deploy (section 5).

## 4. Before any real data: Supabase checklist (required)
The browser is never trusted. All protection must live on the server side of Supabase.
1. **Real authentication.** Use Supabase Auth (email + strong password or magic link) and turn on TOTP MFA. The 4-digit PIN stays only as a quick local unlock on top of a valid session. It must never be the password.
2. **Disable public sign-ups** (single-user app). Create your one user manually.
3. **Row Level Security on every table, no exceptions.** Add a `user_id uuid default auth.uid()` column and policies such as `using (auth.uid() = user_id) with check (auth.uid() = user_id)`. Tables without RLS are readable by anyone with the public key.
4. **Keys:** only the `anon` public key goes in the front end (it is public by design and safe only because of RLS). The `service_role` key must never appear in the repo, the build, or any `NEXT_PUBLIC_*` variable. Keep any secret in the host's environment settings.
5. **Test it:** with no login, query every table using the anon key and confirm zero rows. Run Supabase's security advisor.
6. **Storage buckets private**, with signed URLs for photos and documents. No public buckets for medical or finance files.
7. **Sensitive columns** (medical notes, vitals): consider encrypting on the device before upload so the database holds ciphertext.
8. **Telegram bot (planned):** use a webhook secret token, accept messages only from your own chat id, run it as a server function (not in the browser), and validate and limit input.
9. **CSP:** add only your exact Supabase project URL to `connect-src` in both header files. Do not use wildcards.
10. **Operations:** enable database backups, set short session lifetimes, rotate keys immediately if one leaks, and log sign-ins.
11. Replace the `localStorage` calls in `lib/store.js` (the only file that touches storage). The UI does not change.

## 5. Hosting checklist (before going live)
1. `npm install` then `npm run audit` (fix real findings; do **not** run `npm audit fix --force` blindly).
2. Commit `package-lock.json`; deploy with `npm ci` where the host supports it.
3. `npm run build` (output in `out/`). Deploy that folder. Use Vercel, Netlify or Cloudflare Pages. Keep their analytics off.
4. Delete or replace `public/photo.jpg`.
5. After deploy, check headers at https://securityheaders.com and confirm the page still loads, the lock screen works and the muscle map renders. If the CSP blocks something, the browser console names it.
6. Optional extra layer, free on most hosts: put an access gate in front of the whole site (for example Cloudflare Access) so strangers cannot load the app at all. Check the host's current terms.
7. Open the URL once in a private window and confirm no personal data appears.

## 6. Verification performed here
- Source search: no `dangerouslySetInnerHTML`, `eval`, `new Function`, `innerHTML`, `document.write`, no `console` calls, no external URLs.
- Every tab rendered with test data without errors; PIN hashing, weak-PIN rules and period logic unit-checked.
- **Not possible here:** installing packages and running `next build` (no network), so the real build and the muscle-map library were not run.

## 7. GitHub Pages hosting (chosen host)
Changes this causes, stated precisely:
- **No custom response headers on GitHub Pages.** `public/_headers` and `vercel.json` are unused there (kept for other hosts). The Content-Security-Policy is instead sent as a `<meta http-equiv>` tag in `app/layout.js`, in production builds only. A meta CSP cannot enforce `frame-ancestors`, so clickjacking protection (`X-Frame-Options`), `X-Robots-Tag`, COOP and CORP are **not** available. GitHub Pages provides HTTPS; keep "Enforce HTTPS" ticked in the repo's Pages settings.
- **Search engines:** `robots.txt` is only honoured at a domain root, so it does nothing for a project site. The `noindex` meta tag remains. It is a request to crawlers, not access control: anyone with the link can open the app.
- **Shared origin.** Every GitHub Pages project under `<username>.github.io` shares one browser origin, so they also share `localStorage`. Do not host other apps on the same account that you do not fully trust, and use a custom domain or a separate account when real data is involved. This app's keys all start with `daytrack.`.
- **Public repository (free plan).** The source code is public, along with its full git history. Never commit real data, keys, tokens or `.env` files. Currently there are none.
- **Build pipeline** (`.github/workflows/deploy.yml`): runs on push to `main`, minimal permissions (`contents: read`, `pages: write`, `id-token: write`), Node 22, builds the static export and publishes the `out/` folder. Actions are referenced by major version tag. For stricter supply-chain safety, pin them to commit SHAs. Commit `package-lock.json` so installs are reproducible.
- **Base path:** `next.config.js` sets it from the repository name automatically during the Actions build. Local `npm run dev` is unaffected.
- **Install as an app:** `public/manifest.webmanifest` plus icons let phones add it to the home screen. There is no service worker, so nothing is cached for offline use and updates appear on the next reload.
- **Data lives per device and per browser.** Your phone and your PC will not share data until Supabase is added. Clearing browser data erases it. Keep to dummy data until section 4 is done.
