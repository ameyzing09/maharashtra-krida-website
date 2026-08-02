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
import TabFilter, { type Tab } from "../component/tournament/TabFilter";
import { MotionGrid, MotionItem } from "../component/common/motion";

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
      {/* Title plus the pill group came to ~400px against a phone's ~330px, and
          this container does not clip — so the row widened the whole document
          and the header and footer scrolled sideways with it. TabFilter
          collapses to an icon below `sm`. No menu footer: this page is where
          "View all tournaments" would have gone. */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tournaments</h1>
        <TabFilter value={tab} onChange={setTab} />
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
