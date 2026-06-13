import { linesForCountry } from "../data/crisisLines.js";

/* ------------------------------------------------------------------ */
/*  Resolve crisis lines for the current user, wherever the app runs.   */
/*                                                                      */
/*  Strategy:                                                           */
/*   • First try our own /api/crisis-lines (present on Vercel/Netlify/  */
/*     any serverless host). It reads the registered account country    */
/*     and/or the edge IP-geo header and returns the right lines.       */
/*   • If that endpoint isn't there (static host like GitHub Pages or   */
/*     StackBlitz), detect the country in the browser and look the      */
/*     lines up from the bundled dataset instead.                       */
/*                                                                      */
/*  `accountCountry` (the user's registered region) always takes        */
/*  precedence over IP geolocation.                                     */
/* ------------------------------------------------------------------ */

async function detectCountryClient() {
  // Privacy-light, key-free, CORS-enabled IP-country lookups. We only ever
  // read the 2-letter country code; we never store the IP.
  const probes = [
    { url: "https://get.geojs.io/v1/ip/country.json", pick: (j) => j.country },
    { url: "https://ipapi.co/country/", pick: (t) => t },
  ];
  for (const p of probes) {
    try {
      const r = await fetch(p.url, { signal: AbortSignal.timeout(3500) });
      if (!r.ok) continue;
      const ct = r.headers.get("content-type") || "";
      const body = ct.includes("json") ? await r.json() : (await r.text()).trim();
      const code = p.pick(body);
      if (code && /^[A-Za-z]{2}$/.test(code)) return code.toUpperCase();
    } catch {
      /* try the next probe */
    }
  }
  return null;
}

export async function resolveCrisisLines({ accountCountry } = {}) {
  // 1. Try the server endpoint (does account + IP geo for us).
  try {
    const qs = accountCountry ? `?country=${encodeURIComponent(accountCountry)}` : "";
    const r = await fetch(`/api/crisis-lines${qs}`, { signal: AbortSignal.timeout(4000) });
    if (r.ok && (r.headers.get("content-type") || "").includes("json")) {
      return await r.json();
    }
  } catch {
    /* fall through to client detection */
  }

  // 2. Static host: account country wins, else detect via IP, else fallback.
  const country = accountCountry || (await detectCountryClient());
  return {
    source: accountCountry ? "account" : country ? "ip" : "fallback",
    ...linesForCountry(country),
  };
}
