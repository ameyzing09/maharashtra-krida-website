import type { EventProps } from "../types";
import type { Match, ScoreCardData } from "../types/tournament";

// Normalize event.sport to a score kind used in MatchScore
function sportToKind(sport: string): ScoreCardData["kind"] {
  const s = sport.toLowerCase();
  if (s.includes("cricket")) return "cricket";
  if (s.includes("football") || s.includes("soccer")) return "football";
  if (s.includes("volley")) return "volleyball";
  return "other";
}

export function toScoreCardData(
  match: Match,
  event: EventProps,
  resolved: { teamA: ScoreCardData["teamA"]; teamB: ScoreCardData["teamB"] }
): ScoreCardData {
  const kind = sportToKind(event.sport);
  const base = {
    matchId: match.id,
    eventId: match.eventId,
    tournamentTitle: event.name,
    scheduledAt: match.scheduledAt,
    venue: match.venue,
    status: match.status,
    teamA: resolved.teamA,
    teamB: resolved.teamB,
  } as const;

  // If match.score exists and kind matches, keep it; else leave undefined
  const score = match.score;
  switch (kind) {
    case "cricket":
      return { kind, ...base, score: score?.kind === "cricket" ? score.data : undefined };
    case "football":
      return { kind, ...base, score: score?.kind === "football" ? score.data : undefined };
    case "volleyball":
      return { kind, ...base, score: score?.kind === "volleyball" ? score.data : undefined };
    default:
      return { kind: "other", ...base, score: score?.kind === "other" ? score.data : undefined };
  }
}
