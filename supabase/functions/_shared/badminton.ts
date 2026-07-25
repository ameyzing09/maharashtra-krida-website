// Shared category/fee constants for badminton registrations. MUST stay in
// sync with src/constants/badminton.ts (client) — the server here is the
// source of truth for the amount actually charged.

export const FEE_MAP: Record<string, number> = {
  mens_singles: 150000,
  womens_singles: 150000,
  mens_doubles: 300000,
  womens_doubles: 300000,
  mixed_doubles: 300000,
  team_event: 500000,
};

// Allowed player counts per category: [min, max]. The team event collects no
// player details — only a team name — and is exclusive: it cannot be combined
// with any other entry in the same registration.
export const PLAYER_BOUNDS: Record<string, [number, number]> = {
  mens_singles: [1, 1],
  womens_singles: [1, 1],
  mens_doubles: [2, 2],
  womens_doubles: [2, 2],
  mixed_doubles: [2, 2],
};

export const CATEGORY_LABEL: Record<string, string> = {
  mens_singles: "Men's Singles",
  womens_singles: "Women's Singles",
  mens_doubles: "Men's Doubles",
  womens_doubles: "Women's Doubles",
  mixed_doubles: "Mixed Doubles",
  team_event: "Corporate Team Event",
};
