import type { EventProps } from "../types";
import type { Match } from "../types/tournament";
import { parseFlexibleDate } from "./date";

/**
 * Keep events whose date >= today (start of day). Events with unparseable dates are kept (conservative).
 * Returns a new array sorted ascending by date.
 */
export function filterUpcomingEvents(events: readonly EventProps[]): EventProps[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return events
    .filter((e) => {
      const d = parseFlexibleDate(e.date);
      if (!d) return true; // unparseable → keep
      return d >= todayStart;
    })
    .sort((a, b) => {
      const da = parseFlexibleDate(a.date);
      const db = parseFlexibleDate(b.date);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.getTime() - db.getTime();
    });
}

/**
 * Keep matches whose scheduledAt is in the future. Preserves original sort order.
 */
export function filterUpcomingMatches(matches: readonly Match[]): Match[] {
  const now = Date.now();
  return matches.filter((m) => m.scheduledAt >= now);
}
