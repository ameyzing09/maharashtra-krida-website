// Pune's Corporate Badminton Bash 2026 — category / fee definitions.
//
// IMPORTANT: fee amounts (in paise) are mirrored server-side in
// `supabase/functions/_shared/badminton.ts` (FEE_MAP). The server is the source
// of truth for what is actually charged, so if these two drift the page quotes
// one price and the card is debited another. `_shared/badminton.test.ts` fails
// on any mismatch — change both files together.

export type BadmintonCategory =
  | "mens_singles"
  | "womens_singles"
  | "mens_doubles"
  | "womens_doubles"
  | "mixed_doubles"
  | "team_event";

export type CategoryMeta = {
  code: BadmintonCategory;
  label: string;
  /** Entry fee in paise. */
  fee: number;
  /** Fixed player count, or a [min, max] range for the team event. */
  players: number | [number, number];
  /** Unit shown next to the fee, e.g. "per entry" / "per team". */
  unit: string;
  /** Whether the entry form collects per-player details for this category. */
  collectsPlayers: boolean;
  /** For mixed doubles: hint that one male + one female is expected. */
  note?: string;
};

export const BADMINTON_CATEGORIES: CategoryMeta[] = [
  { code: "mens_singles", label: "Men's Singles", fee: 150000, players: 1, unit: "per entry", collectsPlayers: true },
  { code: "womens_singles", label: "Women's Singles", fee: 150000, players: 1, unit: "per entry", collectsPlayers: true },
  { code: "mens_doubles", label: "Men's Doubles", fee: 200000, players: 2, unit: "per team", collectsPlayers: true },
  { code: "womens_doubles", label: "Women's Doubles", fee: 200000, players: 2, unit: "per team", collectsPlayers: true },
  {
    code: "mixed_doubles",
    label: "Mixed Doubles",
    fee: 200000,
    players: 2,
    unit: "per team",
    collectsPlayers: true,
    note: "One male and one female player.",
  },
  {
    code: "team_event",
    label: "Corporate Team Event",
    fee: 400000,
    players: [2, 4],
    unit: "per team",
    collectsPlayers: false,
    note: "2 Singles + 1 Doubles per tie, 2–4 players. Only the team name is needed now; the roster is collected before the Captains' Meeting.",
  },
];

export const CATEGORY_BY_CODE: Record<BadmintonCategory, CategoryMeta> =
  BADMINTON_CATEGORIES.reduce((acc, c) => {
    acc[c.code] = c;
    return acc;
  }, {} as Record<BadmintonCategory, CategoryMeta>);

export function isTeamEvent(code: BadmintonCategory): boolean {
  return code === "team_event";
}

/** Min/max players allowed for a category. */
export function playerBounds(code: BadmintonCategory): { min: number; max: number } {
  const p = CATEGORY_BY_CODE[code].players;
  return Array.isArray(p) ? { min: p[0], max: p[1] } : { min: p, max: p };
}

/** Format paise as an INR string, e.g. 150000 -> "₹1,500". */
export function formatINR(paise: number): string {
  return (paise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

// Tournament facts surfaced on the page.
export const TOURNAMENT = {
  title: "Pune's Corporate Badminton Bash 2026",
  edition: "5th Edition",
  venue: "Nahata Sports Complex, Sinhagad Road, Pune",
  playingDates: "29 & 30 August 2026",
  reserveDates: "5 & 6 September 2026",
  lastRegistration: "21 August 2026",
  prizePool: "₹30,500",
  /** Qualifier shown after the prize pool in the hero copy, not on the fact tile. */
  prizePoolNote: "including the Triple Crown",
  organizer: "Maharashtra Krida",
  contactName: "Ashwin Panhalkar",
  contactPhone: "+91 98901 71195",
} as const;
