import { linesForCountry } from "../src/data/crisisLines.js";

/* ------------------------------------------------------------------ */
/*  GET /api/crisis-lines?country=XX                                    */
/*                                                                      */
/*  Resolves which crisis lines to show, in priority order:            */
/*    1. ?country=XX  — the user's REGISTERED account country (set at   */
/*       sign-up / in their profile). This always wins, because where   */
/*       someone lives matters more than where their IP happens to be.  */
/*    2. IP geolocation — read from the edge/CDN header the host adds    */
/*       (Vercel: x-vercel-ip-country, Cloudflare: cf-ipcountry, etc).   */
/*       No third-party lookup, no IP stored.                           */
/*    3. International fallback (findahelpline.com).                     */
/*                                                                      */
/*  Runs on Vercel (and any Node serverless host). On a purely static   */
/*  host this file isn't executed and the client falls back on its own  */
/*  geo detection — see src/lib/crisis.js.                              */
/* ------------------------------------------------------------------ */

function ipCountryFromHeaders(headers) {
  const h = (name) => headers[name] || headers[name.toLowerCase()];
  return (
    h("x-vercel-ip-country") || // Vercel
    h("cf-ipcountry") ||        // Cloudflare
    h("x-country") ||           // some proxies / Netlify rewrites
    h("x-geo-country") ||
    null
  );
}

export default function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const accountCountry = url.searchParams.get("country");

  const ipCountry = ipCountryFromHeaders(req.headers || {});
  const resolved = accountCountry || ipCountry || null;
  const source = accountCountry ? "account" : ipCountry ? "ip" : "fallback";

  const data = linesForCountry(resolved);

  // Crisis info isn't sensitive to cache, but it's tiny and changes rarely.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).end(JSON.stringify({ source, ...data }));
}
