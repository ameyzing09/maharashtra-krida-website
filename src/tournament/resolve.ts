import type { EventTeam, ID, Match, ResolvedTeam, ResolvedTeams, Team } from "../types/tournament";

export function resolveTeamsForMatch(
  match: Pick<Match, "teamAId" | "teamBId" | "eventId">,
  teams: Team[],
  eventTeams: EventTeam[]
): ResolvedTeams {
  const teamMap = new Map<ID, Team>(teams.map((t) => [t.id, t]));
  const overrideMap = new Map<ID, EventTeam>();
  for (const et of eventTeams) {
    if (et.eventId === match.eventId) {
      overrideMap.set(et.teamId, et);
    }
  }

  function build(id: ID): ResolvedTeam {
    const base = teamMap.get(id);
    if (!base) {
      return { id, name: "Unknown Team" };
    }
    const ov = overrideMap.get(id);
    return {
      id,
      name: base.name,
      short: ov?.short ?? base.short,
      logoUrl: ov?.logoOverride ?? base.logoUrl,
      seed: ov?.seed,
      group: ov?.group,
    };
  }

  return { teamA: build(match.teamAId), teamB: build(match.teamBId) };
}

