// The category table exists twice — once for the browser, once for the server —
// because Deno and Vite cannot share a module. The client copy is what the page
// *quotes*; FEE_MAP is what the card is actually *debited*. Until this file
// existed the only thing keeping them equal was a comment.
//
// Drift here is a money bug in the most direct sense: the registration form
// shows ₹2,000, Razorpay charges ₹3,000, and nothing anywhere fails.
//
// Reaching outside supabase/functions/ is safe — src/constants/badminton.ts has
// no imports of its own, and *.test.ts files are never part of a deployed
// function's bundle.
import { assertEquals } from "@std/assert";
import { BADMINTON_CATEGORIES, BadmintonCategory } from "../../../src/constants/badminton.ts";
import { CATEGORY_LABEL, FEE_MAP, isCategory, PLAYER_BOUNDS } from "./badminton.ts";

Deno.test("client and server agree on every entry fee", () => {
  const client = Object.fromEntries(BADMINTON_CATEGORIES.map((c) => [c.code, c.fee]));
  // Compared as whole objects so a missing or extra category fails too, and the
  // diff names the offending fee rather than just "expected true".
  assertEquals(client, FEE_MAP as Record<string, number>);
});

Deno.test("client and server cover exactly the same categories", () => {
  const client = BADMINTON_CATEGORIES.map((c) => c.code).sort();
  assertEquals(client, Object.keys(FEE_MAP).sort() as BadmintonCategory[]);
  assertEquals(client, Object.keys(CATEGORY_LABEL).sort() as BadmintonCategory[]);
});

Deno.test("client and server agree on every category label", () => {
  const client = Object.fromEntries(BADMINTON_CATEGORIES.map((c) => [c.code, c.label]));
  assertEquals(client, CATEGORY_LABEL as Record<string, string>);
});

// The server validates rosters against PLAYER_BOUNDS while the form collects
// against `players`; a mismatch means the UI accepts an entry the server then
// rejects with "requires N player(s)".
Deno.test("client and server agree on player counts, team event excepted", () => {
  for (const c of BADMINTON_CATEGORIES) {
    if (c.code === "team_event") continue; // no roster — deliberately absent server-side
    const [min, max] = PLAYER_BOUNDS[c.code];
    assertEquals([min, max], Array.isArray(c.players) ? c.players : [c.players, c.players], c.code);
  }
});

Deno.test("the team event has no server-side player bounds", () => {
  assertEquals(Object.hasOwn(PLAYER_BOUNDS, "team_event"), false);
});

Deno.test("every client category is one the server will accept", () => {
  for (const c of BADMINTON_CATEGORIES) {
    assertEquals(isCategory(c.code), true, `server rejects client category ${c.code}`);
  }
});
