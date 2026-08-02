import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { getEvents } from "../services/eventService";
import { listTeams } from "../services/teamService";
import { listMatchesByEvent } from "../services/matchService";
import { listEventTeams } from "../services/eventTeamService";
import type { EventProps } from "../types";
import type { EventTeam, Match, Team } from "../types/tournament";
import TeamsTab from "../component/tournament/admin/TeamsTab";
import ScheduleTab from "../component/tournament/admin/ScheduleTab";
import MatchesTab from "../component/tournament/admin/MatchesTab";

type AdminTab = "teams" | "schedule" | "matches";

export default function TournamentAdmin() {
  const [tab, setTab] = useState<AdminTab>("teams");
  const [events, setEvents] = useState<EventProps[]>([]);
  const [eventId, setEventId] = useState<string>("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [eventTeams, setEventTeams] = useState<EventTeam[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    (async () => {
      const [ev, tm] = await Promise.all([getEvents(), listTeams()]);
      setEvents(ev);
      setTeams(tm);
      if (ev[0]) setEventId(ev[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!eventId) return;
    (async () => {
      const [ets, ms] = await Promise.all([listEventTeams(eventId), listMatchesByEvent(eventId)]);
      setEventTeams(ets);
      setMatches(ms);
    })();
  }, [eventId]);

  const event = useMemo(() => events.find((e) => e.id === eventId), [events, eventId]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tournament Admin</h1>
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="glass-input text-sm px-3 py-2"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      </div>

      <div className="glass-panel-subtle inline-flex rounded-full p-1 mb-4">
        {([
          ["teams", "Teams"],
          ["schedule", "Schedule"],
          ["matches", "Matches"],
        ] as [AdminTab, string][]).map(([key, label]) => (
          <motion.button
            key={key}
            onClick={() => setTab(key)}
            whileHover={{ y: tab === key ? 0 : -1 }}
            whileTap={{ scale: tab === key ? 1 : 0.98 }}
            className={`px-3 py-1.5 text-sm rounded-full ${
              tab === key ? "glass-button-primary rounded-full" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {tab === "teams" && (
        <TeamsTab
          teams={teams}
          refreshTeams={async () => setTeams(await listTeams())}
          eventId={eventId}
          refreshEventTeams={async () => setEventTeams(await listEventTeams(eventId))}
        />
      )}

      {tab === "schedule" && event && (
        <ScheduleTab
          eventId={eventId}
          teams={teams}
          eventTeams={eventTeams}
          refreshMatches={async () => setMatches(await listMatchesByEvent(eventId))}
        />
      )}

      {tab === "matches" && event && (
        <MatchesTab
          event={event}
          matches={matches}
          teams={teams}
          eventTeams={eventTeams}
          refreshMatches={async () => setMatches(await listMatchesByEvent(eventId))}
        />
      )}
    </div>
  );
}
