import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// When building for GitHub Pages the site is served from /<repo>/, so the
// asset base must match. Vercel/Netlify/local serve from root, so base="/".
// The Pages workflow sets GITHUB_PAGES=true.
const base = process.env.GITHUB_PAGES ? "/alan-orbit/" : "/";

export default defineConfig({
  base,
  plugins: [react()],
});
