/* ------------------------------------------------------------------ */
/*  Crisis & recovery lines, keyed by ISO 3166-1 alpha-2 country code. */
/*                                                                      */
/*  Single source of truth — imported by BOTH the client (src/) and    */
/*  the serverless function (api/crisis-lines.js), so the app and the   */
/*  server can never drift apart.                                       */
/*                                                                      */
/*  IMPORTANT: these are well-known public lines gathered for the       */
/*  prototype. Before launch, have each entry verified by someone on    */
/*  the ground in that country and refreshed on a schedule — numbers    */
/*  and operating hours change.                                         */
/* ------------------------------------------------------------------ */

export const CRISIS_LINES = {
  US: {
    country: "United States",
    lines: [
      { name: "988 Suicide & Crisis Lifeline", phone: "988", sms: "988", note: "Call or text · 24/7" },
      { name: "SAMHSA National Helpline", phone: "1-800-662-4357", note: "Treatment referrals · 24/7" },
    ],
  },
  GB: {
    country: "United Kingdom",
    lines: [
      { name: "Samaritans", phone: "116 123", note: "Free · 24/7" },
      { name: "SHOUT", sms: "85258", note: "Text SHOUT to 85258 · 24/7" },
    ],
  },
  CA: {
    country: "Canada",
    lines: [
      { name: "9-8-8 Suicide Crisis Helpline", phone: "988", sms: "988", note: "Call or text · 24/7" },
      { name: "Talk Suicide Canada", phone: "1-833-456-4566", note: "24/7 · text 45645 (4pm–midnight ET)" },
    ],
  },
  AU: {
    country: "Australia",
    lines: [
      { name: "Lifeline", phone: "13 11 14", note: "Call · 24/7 · text 0477 13 11 14" },
      { name: "Beyond Blue", phone: "1300 22 4636", note: "24/7" },
    ],
  },
  NZ: {
    country: "New Zealand",
    lines: [
      { name: "1737 — Need to talk?", phone: "1737", sms: "1737", note: "Call or text · 24/7" },
      { name: "Lifeline Aotearoa", phone: "0800 543 354", note: "24/7" },
    ],
  },
  IE: {
    country: "Ireland",
    lines: [
      { name: "Samaritans", phone: "116 123", note: "Free · 24/7" },
      { name: "Pieta", phone: "1800 247 247", sms: "51444", note: "Text HELP to 51444 · 24/7" },
    ],
  },
  IN: {
    country: "India",
    lines: [
      { name: "Tele-MANAS", phone: "14416", note: "Govt mental-health line · 24/7" },
      { name: "iCall (TISS)", phone: "9152987821", note: "Mon–Sat, 8am–10pm" },
    ],
  },
  MY: {
    country: "Malaysia",
    lines: [
      { name: "Befrienders KL", phone: "03-7627 2929", note: "Emotional support · 24/7" },
      { name: "Talian Kasih", phone: "15999", note: "Govt helpline · 24/7" },
      { name: "MMHA", phone: "03-2780 6803", note: "Malaysian Mental Health Association" },
    ],
  },
  SG: {
    country: "Singapore",
    lines: [
      { name: "Samaritans of Singapore (SOS)", phone: "1767", sms: "9151 1767", note: "Call · 24/7 · CareText on WhatsApp" },
      { name: "IMH Mental Health Helpline", phone: "6389 2222", note: "24/7" },
    ],
  },
  ID: {
    country: "Indonesia",
    lines: [
      { name: "Kemenkes SEJIWA", phone: "119 ext. 8", note: "Govt mental-health line" },
      { name: "Into The Light Indonesia", phone: "021-7888 2025", note: "Suicide prevention community" },
    ],
  },
  PH: {
    country: "Philippines",
    lines: [
      { name: "NCMH Crisis Hotline", phone: "1553", note: "Nationwide, toll-free · 24/7" },
      { name: "Hopeline PH", phone: "0917-558-4673", note: "24/7" },
    ],
  },
  ZA: {
    country: "South Africa",
    lines: [
      { name: "SADAG Suicide Crisis Line", phone: "0800 567 567", note: "24/7" },
      { name: "SADAG Mental Health Line", phone: "011 234 4837", note: "8am–8pm" },
    ],
  },
};

/* International fallback when we don't have lines for a country (or */
/* can't tell where someone is). findahelpline.com routes to local   */
/* verified services worldwide.                                      */
export const DEFAULT_LINES = {
  country: "International",
  lines: [
    { name: "Find a Helpline", phone: "findahelpline.com", note: "Verified crisis lines in your country" },
    { name: "Local emergency services", phone: "112 / 911", note: "If you're in immediate danger" },
  ],
};

/* Regions offered in the profile picker (account / registration country). */
export const SUPPORTED_REGIONS = Object.entries(CRISIS_LINES)
  .map(([code, v]) => ({ code, country: v.country }))
  .sort((a, b) => a.country.localeCompare(b.country));

/** Return the crisis-line block for a country code, falling back to the
 *  international directory. Accepts null/unknown codes safely. */
export function linesForCountry(code) {
  const cc = (code || "").toUpperCase();
  const block = CRISIS_LINES[cc];
  if (!block) return { code: "DEFAULT", ...DEFAULT_LINES };
  return { code: cc, ...block };
}
