# ORBIT — recovery, in orbit

A calm, judgment-free recovery community prototype. Daily check-ins shown as a
growing orbit, mood logging, support circles, accountability rooms, a feed with
sensitive-content veils, and crisis help that is always one tap away.

Built with **React + Vite**. The whole UI lives in a single component
(`src/Orbit.jsx`) with its own design tokens, so it is trivial to drop into a
bigger app later. Session state (your day count, mood, posts, joined circles)
persists in `localStorage`, so the prototype "remembers" you across reloads —
which makes live demos feel real.

## Location-aware crisis help

The Help sheet shows crisis & recovery lines matched to **where the user is**,
resolved in this priority order:

1. **Registered account region** — set at sign-up or in **Profile → Your
   region**. This always wins, because where someone *lives* matters more than
   where their IP happens to be (travel, VPNs).
2. **IP geolocation** — when no region is set. On a serverless host
   (`api/crisis-lines.js`) this is read from the edge's geo header
   (`x-vercel-ip-country`, `cf-ipcountry`, …) with **no third-party lookup and
   no IP stored**. On a static host the browser does a key-free country lookup.
3. **International fallback** — `findahelpline.com`, which routes to verified
   local services worldwide.

The country → lines dataset lives in **one place** (`src/data/crisisLines.js`)
and is imported by both the client and the serverless function, so they can
never drift. Add a country by adding one entry there.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build into dist/
npm run preview  # serve the production build on :4173
```

## Project it live (pick one)

You want a shareable URL where the whole idea shows up nicely — same vibe as a
preview link. Easiest to hardest:

### 1. StackBlitz / CodeSandbox — instant, zero setup
Open the repo in the browser, no account changes needed:

- StackBlitz: `https://stackblitz.com/github/azlanis369/alan-orbit`
- CodeSandbox: `https://codesandbox.io/p/github/azlanis369/alan-orbit`

Great for "open this link and play with it right now."

### 2. GitHub Pages — already wired up, free, no extra account
`.github/workflows/deploy.yml` builds and publishes on every push to `main`
(and to the prototype branch). To turn it on once:

1. Push this repo to GitHub.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The next push deploys to:
   **https://azlanis369.github.io/alan-orbit/**

The Vite `base` is switched to `/alan-orbit/` automatically in CI via the
`GITHUB_PAGES` env var, so assets resolve correctly under the repo subpath.

### 3. Vercel — recommended (real server-side IP geolocation)
This is the one to use now that Help is location-aware: Vercel runs
`api/crisis-lines.js` and gives it the visitor's country from the edge, so the
right lines appear automatically — no third-party call, no IP stored.

1. Go to vercel.com → **Add New → Project → Import** `azlanis369/alan-orbit`.
2. Vercel auto-detects Vite (build `npm run build`, output `dist`) and serves
   `/api/*` as serverless functions (`vercel.json` is included). Click Deploy.
3. You get a `*.vercel.app` URL plus automatic preview deploys for every branch
   and PR — the closest match to the "see the whole idea on a link" workflow.

Sanity-check the function after deploy:
`https://<your-app>.vercel.app/api/crisis-lines?country=MY` → Malaysian lines.

### 4. Netlify — equally simple (also server-side geo)
`netlify.toml` is included. Import the repo at app.netlify.com, or run
`npx netlify deploy --prod`. The same `/api/crisis-lines` function runs here.

> **GitHub Pages note:** Pages is static, so `api/crisis-lines.js` doesn't run
> there. The app still works — it falls back to a browser-side country lookup —
> but for true server-side geo with zero third-party calls, deploy to Vercel or
> Netlify.

## Before this becomes a real product
- The crisis lines in the Help sheet are **US placeholders**. Swap in verified,
  localized crisis and recovery numbers for every region/language you support.
- Posts, reactions, and rooms are local-only mock data. Wire them to a real
  backend with proper moderation, abuse reporting, and privacy controls.
- The "Export / Delete my data" actions are stubs — make them real before
  asking anyone to trust the app with sensitive recovery information.
