import { useEffect, useMemo, useState } from "react";
import { listLive, listRecentCompleted, listMatchesByStatus } from "../../services/matchService";
import { getEvents } from "../../services/eventService";
import { listTeams } from "../../services/teamService";
import { listEventTeams } from "../../services/eventTeamService";
import type { EventProps } from "../../types";
import type { EventTeam, Match, ScoreCardData, Team } from "../../types/tournament";
import { resolveTeamsForMatch } from "../../tournament/resolve";
import { toScoreCardData } from "../../tournament/adapter";
import ScoreCard from "./ScoreCard";
import { Link } from "react-router-dom";
import { calculateScoreCardsOnHome } from "../../";
import useToast from "../../hook/useToast";
import Toast from "../common/Toast";
import { TailSpin } from "react-loader-spinner";

export default function LiveRecentWidget() {
  const [events, setEvents] = useState<EventProps[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [eventTeams, setEventTeams] = useState<EventTeam[]>([]);
  const [live, setLive] = useState<Match[]>([]);
  const [recent, setRecent] = useState<Match[]>([]);
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [limit, setLimit] = useState<number>(() => calculateScoreCardsOnHome());
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();
  type Tab = "live" | "upcoming" | "past";
  const [tab, setTab] = useState<Tab>("live");
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [ev, tm, lv, up, rc] = await Promise.all([
          getEvents(),
          listTeams(),
          listLive(12),
          listMatchesByStatus("upcoming", 24),
          listRecentCompleted(10),
        ]);
        setEvents(ev);
        setTeams(tm);
        // gather event teams for any event present in matches
        const eventIds = Array.from(new Set([...lv, ...up, ...rc].map((m) => m.eventId)));
        const overrides = (await Promise.all(eventIds.map((e) => listEventTeams(e)))).flat();
        setEventTeams(overrides);
        setLive(lv);
        setUpcoming(up);
        setRecent(rc);
      } catch (err) {
        console.error("Error loading matches:", err);
        showToast("Failed to load matches", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const onResize = () => setLimit(calculateScoreCardsOnHome());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Auto-switch to Past if there are no live matches loaded
  useEffect(() => {
    if (autoSwitchEnabled && !loading && tab === "live" && live.length === 0 && recent.length > 0) {
      setTab("past");
    }
  }, [autoSwitchEnabled, loading, tab, live.length, recent.length]);

  const cards: ScoreCardData[] = useMemo(() => {
    const byId = new Map(events.map((e) => [e.id, e]));
    const pick = (ms: Match[]) =>
      ms.map((m) => {
        const event = byId.get(m.eventId);
        if (!event) return null;
        const resolved = resolveTeamsForMatch(m, teams, eventTeams);
        return toScoreCardData(m, event, resolved);
      })
        .filter((x): x is ScoreCardData => !!x);
    let pool: ScoreCardData[] = [];
    if (tab === "live") pool = pick(live);
    else if (tab === "upcoming") pool = pick(upcoming);
    else pool = pick(recent);
    return pool.slice(0, limit);
  }, [events, teams, eventTeams, live, upcoming, recent, limit, tab]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-charcoal dark:text-white">Tournaments</h2>
          <div className="inline-flex rounded-full bg-black/5 dark:bg-white/10 p-1">
            {([
              ["live", "Live"],
              ["upcoming", "Upcoming"],
              ["past", "Past"],
            ] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setAutoSwitchEnabled(false); setTab(key); }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-full ${
                  tab === key ? "bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-gray-100 shadow" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <Link to="/tournaments" className="text-sm text-brand-lime hover:underline">View all</Link>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <TailSpin color="#84cc16" height={40} width={40} />
        </div>
      ) : cards.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {tab === "live" && "No live matches currently."}
          {tab === "upcoming" && "No upcoming matches."}
          {tab === "past" && "No past matches."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <Link key={c.matchId} to="/tournaments" className="block">
              <ScoreCard data={c} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
