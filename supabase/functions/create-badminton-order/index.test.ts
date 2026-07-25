import { assertEquals } from "@std/assert";
import { computeAmount, summarizeCategories, validate } from "./index.ts";

const org = {
  companyName: "Acme",
  contactPersonName: "Jane",
  officialEmail: "jane@acme.com",
  phone: "9876543210",
  state: "Maharashtra",
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

Deno.test("team mixed with individual is rejected", () => {
  assertEquals(
    validate(org, [
      { category: "team_event", teamName: "Smashers", players: [] },
      { category: "womens_singles", players: [player] },
    ]),
    "Corporate Team Event cannot be combined with other categories"
  );
});

Deno.test("two team entries rejected", () => {
  assertEquals(
    validate(org, [
      { category: "team_event", teamName: "A", players: [] },
      { category: "team_event", teamName: "B", players: [] },
    ]),
    "Corporate Team Event cannot be combined with other categories"
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

Deno.test("missing state rejected", () => {
  const { state: _state, ...noState } = org;
  assertEquals(
    validate(noState, [{ category: "womens_singles", players: [player] }]),
    "Select a valid state"
  );
});

Deno.test("unrecognized state rejected", () => {
  assertEquals(
    validate({ ...org, state: "Narnia" }, [{ category: "womens_singles", players: [player] }]),
    "Select a valid state"
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
