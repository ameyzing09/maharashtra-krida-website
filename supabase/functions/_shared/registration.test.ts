import { assert, assertEquals, assertMatch } from "@std/assert";
import { computeAmount, generateReferenceCode, summarizeCategories, validate } from "./registration.ts";

const org = {
  companyName: "Acme",
  contactPersonName: "Jane",
  officialEmail: "jane@acme.com",
  phone: "9876543210",
};
const player = { name: "Jane Doe", phone: "9876543210", officialEmail: "jane@acme.com" };

Deno.test("valid individual mix passes", () => {
  assertEquals(
    validate(org, [
      { category: "womens_singles", players: [player] },
      { category: "mixed_doubles", players: [player, { ...player, name: "John" }] },
    ]),
    null
  );
});

Deno.test("valid team-only passes", () => {
  assertEquals(validate(org, [{ category: "team_event", teamName: "Smashers", players: [] }]), null);
});

// A company can enter a corporate team and individual categories together.
Deno.test("team mixed with individual passes", () => {
  assertEquals(
    validate(org, [
      { category: "team_event", teamName: "Smashers", players: [] },
      { category: "womens_singles", players: [player] },
    ]),
    null
  );
});

Deno.test("two team entries pass", () => {
  assertEquals(
    validate(org, [
      { category: "team_event", teamName: "Acme A", players: [] },
      { category: "team_event", teamName: "Acme B", players: [] },
    ]),
    null
  );
});

// Entries are validated individually, so a team entry earlier in the list must
// not let a later bad entry through.
Deno.test("a bad entry after a team entry is still rejected", () => {
  assertEquals(
    validate(org, [
      { category: "team_event", teamName: "Smashers", players: [] },
      { category: "mens_doubles", players: [player] },
    ]),
    "Men's Doubles requires 2 player(s)"
  );
  assertEquals(
    validate(org, [
      { category: "team_event", teamName: "Smashers", players: [] },
      { category: "not_a_category", players: [] },
    ]),
    "Invalid category: not_a_category"
  );
});

Deno.test("a team without a name is rejected even when it isn't first", () => {
  assertEquals(
    validate(org, [
      { category: "womens_singles", players: [player] },
      { category: "team_event", teamName: "", players: [] },
    ]),
    "Team name is required for the Corporate Team Event"
  );
});

Deno.test("team without a real name rejected", () => {
  assertEquals(
    validate(org, [{ category: "team_event", teamName: "S", players: [] }]),
    "Team name is required for the Corporate Team Event"
  );
});

Deno.test("doubles with 1 player rejected", () => {
  assertEquals(
    validate(org, [{ category: "mens_doubles", players: [player] }]),
    "Men's Doubles requires 2 player(s)"
  );
});

Deno.test("bad player email rejected", () => {
  assertEquals(
    validate(org, [{ category: "womens_singles", players: [{ ...player, officialEmail: "bad" }] }]),
    "Invalid player email in Women's Singles"
  );
});

Deno.test("too many entries rejected", () => {
  const entries = Array.from({ length: 11 }, () => ({ category: "womens_singles", players: [player] }));
  assertEquals(validate(org, entries), "Too many entries");
});

Deno.test("company name too long rejected", () => {
  assertEquals(
    validate({ ...org, companyName: "A".repeat(200) }, [{ category: "womens_singles", players: [player] }]),
    "Invalid company name"
  );
});

Deno.test("computeAmount sums fees server-side", () => {
  const total = computeAmount([
    { category: "womens_singles" },
    { category: "mens_doubles" },
  ]);
  assertEquals(total, 150000 + 300000);
});

Deno.test("summarizeCategories includes team name", () => {
  assertEquals(
    summarizeCategories([{ category: "team_event", teamName: "Smashers" }]),
    "Corporate Team Event (Smashers)"
  );
});

Deno.test("generateReferenceCode has the MKB- prefix and unambiguous alphabet", () => {
  const code = generateReferenceCode();
  assertMatch(code, /^MKB-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
  // no ambiguous characters
  assert(!/[01OIL]/.test(code.slice(4)));
});

Deno.test("generateReferenceCode is effectively unique across many draws", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 1000; i++) seen.add(generateReferenceCode());
  assert(seen.size > 995); // collisions across 1000 draws should be ~0
});
