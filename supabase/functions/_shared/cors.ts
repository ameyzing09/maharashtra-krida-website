// Origin allowlist + CORS header helper shared by the public-facing functions.
// Edge Functions are cross-origin from the site's own domain, so unlike the
// old same-origin Netlify Functions, CORS headers are required for browser
// callers — but the allowlist below (not CORS) is the actual security
// boundary; CORS headers only affect what browsers permit, never a curl/bot.

// Matched exactly, not by suffix — a suffix match on a bare domain would also
// let in an attacker-registered lookalike like "evilmaharashtrakrida.in". The
// live domain is pinned here rather than left to the SITE_ORIGIN secret alone,
// so losing that secret can't take checkout down again.
const ALLOWED_HOSTS = ["maharashtrakrida.in", "www.maharashtrakrida.in"];

// Safe as suffixes because of the leading dot.
const ALLOWED_HOST_SUFFIXES = [".netlify.app"];

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // non-browser callers (server-to-server, curl)
  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (ALLOWED_HOSTS.includes(hostname)) return true;
    if (ALLOWED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) return true;
    const siteOrigin = Deno.env.get("SITE_ORIGIN");
    if (siteOrigin && origin === siteOrigin) return true;
    return false;
  } catch {
    return false;
  }
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = isAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    Vary: "Origin",
  };
}
