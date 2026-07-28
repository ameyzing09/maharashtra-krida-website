// Shared category/fee constants and registration payload types. MUST stay in
// sync with src/constants/badminton.ts and src/types/badminton.ts (client) —
// the server here is the source of truth for the amount actually charged.
//
// The duplication is unavoidable: this runs on Deno and the client runs through
// Vite, so there is no module both can import.

export type BadmintonCategory =
  | "mens_singles"
  | "womens_singles"
  | "mens_doubles"
  | "womens_doubles"
  | "mixed_doubles"
  | "team_event";

export const FEE_MAP: Record<BadmintonCategory, number> = {
  mens_singles: 150000,
  womens_singles: 150000,
  mens_doubles: 200000,
  womens_doubles: 200000,
  mixed_doubles: 200000,
  team_event: 400000,
};

// Allowed player counts per category: [min, max]. The team event is absent by
// design — it collects only a team name, not a roster — and the Exclude<> in
// the key type is what makes that explicit rather than an oversight.
export const PLAYER_BOUNDS: Record<Exclude<BadmintonCategory, "team_event">, [number, number]> = {
  mens_singles: [1, 1],
  womens_singles: [1, 1],
  mens_doubles: [2, 2],
  womens_doubles: [2, 2],
  mixed_doubles: [2, 2],
};

export const CATEGORY_LABEL: Record<BadmintonCategory, string> = {
  mens_singles: "Men's Singles",
  womens_singles: "Women's Singles",
  mens_doubles: "Men's Doubles",
  womens_doubles: "Women's Doubles",
  mixed_doubles: "Mixed Doubles",
  team_event: "Corporate Team Event",
};

/** Narrows an untrusted value from the request body to a known category.
 *
 * hasOwnProperty, not `in` and not a truthiness check on FEE_MAP[v]: both of
 * those accept inherited keys, so a crafted `{"category":"toString"}` was
 * treated as a real category and then crashed the PLAYER_BOUNDS destructure
 * (a 500 on attacker-chosen input). Own properties only. */
export function isCategory(v: unknown): v is BadmintonCategory {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(FEE_MAP, v);
}

export type Player = {
  name: string;
  phone: string;
  /** Official / company email — mandatory. */
  officialEmail: string;
  personalEmail?: string;
  designation?: string;
};

export type CategoryEntry = {
  /** Client-side list key. Round-trips through the DB but the server never reads it. */
  id?: string;
  category: BadmintonCategory;
  /** Absent or empty for team_event, which collects only a team name. */
  players?: Player[];
  teamName?: string;
};

export type Organization = {
  companyName: string;
  officialEmail: string;
  phone: string;
  contactPersonName?: string;
  personalEmail?: string;
  /** Registrant's state, used to pick CGST+SGST vs IGST on the invoice. Absent
   *  on the client Organization type but present on the DB column, so older
   *  payloads legitimately omit it. */
  state?: string;
};
