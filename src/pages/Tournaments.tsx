import { useEffect, useMemo, useState } from "react";
import { listMatchesByStatus } from "../services/matchService";
import { getEvents } from "../services/eventService";
import { listTeams } from "../services/teamService";
import { listEventTeams } from "../services/eventTeamService";
import type { EventProps } from "../types";
import type { EventTeam, Match, ScoreCardData, Team } from "../types/tournament";
import { resolveTeamsForMatch } from "../tournament/resolve";
import { toScoreCardData } from "../tournament/adapter";
import ScoreCard from "../component/tournament/ScoreCard";

type Tab = "live" | "upcoming" | "past";

export default function TournamentsPage() {
  const [tab, setTab] = useState<Tab>("live");
  const [events, setEvents] = useState<EventProps[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [eventTeams, setEventTeams] = useState<EventTeam[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    (async () => {
      const [ev, tm] = await Promise.all([getEvents(), listTeams()]);
      setEvents(ev);
      setTeams(tm);
      // prefetch overrides for events we have
      const overrides = (await Promise.all(ev.map((e) => listEventTeams(e.id)))).flat();
      setEventTeams(overrides);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const status = tab === "live" ? "live" : tab === "upcoming" ? "upcoming" : "completed";
      const ms = await listMatchesByStatus(status, 200);
      setMatches(ms);
    })();
  }, [tab]);

  const cards: ScoreCardData[] = useMemo(() => {
    const byId = new Map(events.map((e) => [e.id, e]));
    return matches
      .map((m) => {
        const ev = byId.get(m.eventId);
        if (!ev) return null;
        const resolved = resolveTeamsForMatch(m, teams, eventTeams);
        return toScoreCardData(m, ev, resolved);
      })
      .filter((x): x is ScoreCardData => !!x);
  }, [matches, events, teams, eventTeams]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white">Tournaments</h1>
        <div className="inline-flex rounded-full bg-black/5 dark:bg-white/10 p-1">
          {([
            ["live", "Live"],
            ["upcoming", "Upcoming"],
            ["past", "Past"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 text-sm rounded-full ${
                tab === key ? "bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-gray-100 shadow" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {cards.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No live matches found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <ScoreCard key={c.matchId} data={c} />
          ))}
        </div>
      )}
    </div>
  );
}
