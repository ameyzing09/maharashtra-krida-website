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
import { MotionGrid, MotionItem } from "../component/common/motion";

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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      {/* flex-wrap, not nowrap: the title and the pill group come to ~400px,
          more than a phone's ~330px. Without wrapping this row widened the
          whole document, so the header and footer scrolled sideways with it.
          Unlike the homepage widget the tabs stay visible here — filtering is
          what this page is for. */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tournaments</h1>
        <div className="glass-panel-subtle inline-flex rounded-full p-1">
          {([
            ["live", "Live"],
            ["upcoming", "Upcoming"],
            ["past", "Past"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-full ${
                tab === key ? "glass-button-primary rounded-full" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {cards.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">No live matches found.</p>
      ) : (
        <MotionGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <MotionItem key={c.matchId} className="h-full">
              <ScoreCard data={c} />
            </MotionItem>
          ))}
        </MotionGrid>
      )}
    </div>
  );
}
