import { assertEquals } from "@std/assert";
import { corsHeaders, isAllowedOrigin } from "./cors.ts";

const PROD = "https://maharashtrakrida.in";

Deno.test("the production domain is allowed", () => {
  assertEquals(isAllowedOrigin(PROD), true);
  assertEquals(corsHeaders(PROD)["Access-Control-Allow-Origin"], PROD);
});

Deno.test("the www production domain is allowed", () => {
  const www = "https://www.maharashtrakrida.in";
  assertEquals(isAllowedOrigin(www), true);
  assertEquals(corsHeaders(www)["Access-Control-Allow-Origin"], www);
});

Deno.test("netlify previews and localhost are allowed", () => {
  for (const origin of [
    "https://maharashtra-krida.netlify.app",
    "https://deploy-preview-19--maharashtra-krida.netlify.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]) {
    assertEquals(isAllowedOrigin(origin), true, origin);
  }
});

// The production hosts are matched exactly, never by suffix — otherwise anyone
// could register a lookalike domain and be allowed in.
Deno.test("a lookalike of the production domain is denied", () => {
  for (const origin of [
    "https://evilmaharashtrakrida.in",
    "https://maharashtrakrida.in.attacker.com",
    "https://notnetlify.app",
  ]) {
    assertEquals(isAllowedOrigin(origin), false, origin);
  }
});

Deno.test("an unknown origin is denied and gets a null header", () => {
  assertEquals(isAllowedOrigin("https://example.com"), false);
  assertEquals(corsHeaders("https://example.com")["Access-Control-Allow-Origin"], "null");
});

Deno.test("a malformed origin is denied", () => {
  assertEquals(isAllowedOrigin("not a url"), false);
});

// No Origin header at all means a non-browser caller (curl, server-to-server
// webhooks). CORS is irrelevant to them, so they are not blocked here.
Deno.test("a missing origin is allowed", () => {
  assertEquals(isAllowedOrigin(null), true);
  assertEquals(corsHeaders(null)["Access-Control-Allow-Origin"], "null");
});

Deno.test("SITE_ORIGIN adds an origin without a code change", () => {
  const extra = "https://staging.example.org";
  assertEquals(isAllowedOrigin(extra), false);
  Deno.env.set("SITE_ORIGIN", extra);
  try {
    assertEquals(isAllowedOrigin(extra), true);
    assertEquals(corsHeaders(extra)["Access-Control-Allow-Origin"], extra);
  } finally {
    Deno.env.delete("SITE_ORIGIN");
  }
});
