# ORBIT — recovery, in orbit

A calm, judgment-free recovery community prototype. Daily check-ins shown as a
growing orbit, mood logging, support circles, accountability rooms, a feed with
sensitive-content veils, and crisis help that is always one tap away.

Built with **React + Vite**. The whole UI lives in a single component
(`src/Orbit.jsx`) with its own design tokens, so it is trivial to drop into a
bigger app later. Session state (your day count, mood, posts, joined circles)
persists in `localStorage`, so the prototype "remembers" you across reloads —
which makes live demos feel real.

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

### 3. Vercel — best developer experience, custom domains
1. Go to vercel.com → **Add New → Project → Import** `azlanis369/alan-orbit`.
2. Vercel auto-detects Vite (build `npm run build`, output `dist`). Click Deploy.
3. You get a `*.vercel.app` URL and automatic preview deploys for every branch
   and PR — this is the closest match to the "see the whole idea on a link"
   workflow.

### 4. Netlify — equally simple
`netlify.toml` is included. Import the repo at app.netlify.com, or run
`npx netlify deploy --prod`.

## Before this becomes a real product
- The crisis lines in the Help sheet are **US placeholders**. Swap in verified,
  localized crisis and recovery numbers for every region/language you support.
- Posts, reactions, and rooms are local-only mock data. Wire them to a real
  backend with proper moderation, abuse reporting, and privacy controls.
- The "Export / Delete my data" actions are stubs — make them real before
  asking anyone to trust the app with sensitive recovery information.
