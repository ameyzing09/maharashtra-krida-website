import { SPINNER_COLOR } from "../../constants";
import { MotionSection, MotionGrid, MotionItem } from "../common/motion";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

type Tab = "live" | "upcoming" | "past";

// Rendered twice — as pills on desktop, as a menu on mobile — so the labels
// live here rather than inline in either one.
const TABS: [Tab, string][] = [
  ["live", "Live"],
  ["upcoming", "Upcoming"],
  ["past", "Past"],
];

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
  const [tab, setTab] = useState<Tab>("live");
  const [filterOpen, setFilterOpen] = useState(false);
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
  }, [showToast]);

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
    <MotionSection className="bg-gradient-to-b from-orange-50/70 to-transparent dark:from-slate-900/50 dark:to-transparent">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      {/* The heading alone is ~240px of a phone's ~330px, so the pill group and
          the link cannot sit beside it — they collapse to one icon below `sm`,
          with everything moved into the menu it opens. */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-slate-900 dark:text-slate-100"><span aria-hidden className="mr-3 inline-block h-6 w-1.5 -mb-0.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600" />Tournaments</h2>
        <div className="hidden glass-panel-subtle rounded-full p-1 sm:inline-flex">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setAutoSwitchEnabled(false); setTab(key); }}
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-all duration-200 ${
                tab === key ? "glass-button-primary rounded-full" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Link to="/tournaments" className="ml-auto hidden whitespace-nowrap text-sm link-accent sm:block">View all</Link>
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          aria-expanded={filterOpen}
          aria-controls="tournaments-filter"
          className="glass-panel-subtle ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:hidden"
        >
          <FontAwesomeIcon icon={faFilter} aria-hidden className="h-4 w-4" />
          <span className="sr-only">Filter tournaments</span>
        </button>
      </div>

      {/* Same max-height disclosure the site header uses, so there is no
          click-outside or focus-trap logic to get wrong. The divider separates
          the three filter values from the one navigation action. */}
      <div
        id="tournaments-filter"
        className={`overflow-hidden transition-[max-height] duration-300 sm:hidden ${filterOpen ? "max-h-60" : "max-h-0"}`}
      >
        <div className="glass-panel-subtle mb-4 rounded-2xl p-2">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => { setAutoSwitchEnabled(false); setTab(key); setFilterOpen(false); }}
              aria-current={tab === key ? "true" : undefined}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                tab === key ? "glass-button-primary" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
          <Link to="/tournaments" className="block rounded-xl px-3 py-2 text-sm link-accent">View all tournaments</Link>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <TailSpin color={SPINNER_COLOR} height={40} width={40} />
        </div>
      ) : cards.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {tab === "live" && "No live matches currently."}
          {tab === "upcoming" && "No upcoming matches."}
          {tab === "past" && "No past matches."}
        </p>
      ) : (
        <MotionGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <MotionItem key={c.matchId} whileHover={{ y: -4 }} className="h-full">
              <Link to="/tournaments" className="block h-full">
                <ScoreCard data={c} />
              </Link>
            </MotionItem>
          ))}
        </MotionGrid>
      )}
      </div>
    </MotionSection>
  );
}
