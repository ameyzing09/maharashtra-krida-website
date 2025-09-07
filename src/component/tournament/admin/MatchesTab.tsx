import { useState } from "react";
import type { CricketScore, EventTeam, FootballGoal, ID, Match, MatchStatus, Team, VolleyballSet } from "../../../types/tournament";
import type { EventProps } from "../../../types";
import { resolveTeamsForMatch } from "../../../tournament/resolve";
import { updateMatch } from "../../../services/matchService";
import useToast from "../../../hook/useToast";
import Toast from "../../common/Toast";
import { TailSpin } from "react-loader-spinner";

type Props = {
  event: EventProps;
  matches: Match[];
  teams: Team[];
  eventTeams: EventTeam[];
  refreshMatches: () => Promise<void>;
};

export default function MatchesTab({ event, matches, teams, eventTeams, refreshMatches }: Props) {
  const [editing, setEditing] = useState<Record<ID, Match>>(Object.create(null));
  const [savingIds, setSavingIds] = useState<Set<ID>>(new Set());
  const { toast, showToast } = useToast();

  const setField = (id: ID, patch: Partial<Match>) => setEditing((prev) => ({ ...prev, [id]: { ...(prev[id] ?? matches.find((m) => m.id === id)!), ...patch } }));

  const kind = event.sport.toLowerCase().includes("cricket") ? "cricket" : event.sport.toLowerCase().includes("football") ? "football" : event.sport.toLowerCase().includes("volley") ? "volleyball" : "other";

  const getCricket = (m: Match): CricketScore => {
    const base = editing[m.id] ?? m;
    const sc = base.score;
    if (sc?.kind === "cricket") return sc.data;
    return { a: { runs: 0, wickets: 0, overs: 0 }, b: { runs: 0, wickets: 0, overs: 0 } };
  };
  const setCricket = (m: Match, next: Partial<CricketScore>) => {
    const curr = getCricket(m);
    setField(m.id, { score: { kind: "cricket", data: { ...curr, ...next } } });
  };
  const setCricketA = (m: Match, next: Partial<CricketScore["a"]>) => setCricket(m, { a: { ...getCricket(m).a, ...next } });
  const setCricketB = (m: Match, next: Partial<CricketScore["b"]>) => setCricket(m, { b: { ...getCricket(m).b, ...next } });

  const getFootball = (m: Match) => {
    const base = editing[m.id] ?? m;
    const sc = base.score;
    return sc?.kind === "football" ? sc.data : { aGoals: 0, bGoals: 0 };
  };
  const setFootball = (m: Match, next: Partial<ReturnType<typeof getFootball>>) => {
    const curr = getFootball(m);
    setField(m.id, { score: { kind: "football", data: { ...curr, ...next } } });
  };

  const getVolleyball = (m: Match) => {
    const base = editing[m.id] ?? m;
    const sc = base.score;
    return sc?.kind === "volleyball" ? sc.data : { sets: [] };
  };
  const setVolleyball = (m: Match, next: Partial<ReturnType<typeof getVolleyball>>) => {
    const curr = getVolleyball(m);
    setField(m.id, { score: { kind: "volleyball", data: { ...curr, ...next } } });
  };
  const getOther = (m: Match) => {
    const base = editing[m.id] ?? m;
    const sc = base.score;
    return sc?.kind === "other" ? sc.data : {};
  };

  return (
    <div className="grid gap-4">
      {toast && <Toast message={toast.message} type={toast.type} />}
      {matches
        .slice()
        .sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0))
        .map((m) => {
          const e = editing[m.id] ?? m;
          const resolved = resolveTeamsForMatch(m, teams, eventTeams);
          const statusVal = (e.status ?? m.status ?? "upcoming") as MatchStatus;
          return (
            <div key={m.id} className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2 text-sm text-brand-charcoal dark:text-gray-100">
                  <span className="font-semibold">{resolved.teamA.name}</span>
                  <span className="opacity-60">vs</span>
                  <span className="font-semibold">{resolved.teamB.name}</span>
                  <span className="mx-2 text-gray-600 dark:text-gray-300">·</span>
                  <span className="text-gray-600 dark:text-gray-300">{new Date(m.scheduledAt).toLocaleString()}</span>
                </div>
                <select value={statusVal} onChange={(ev) => setField(m.id, { status: ev.target.value as MatchStatus })} className="ml-auto rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-2 py-1 text-sm">
                  {(["upcoming", "live", "completed", "cancelled"] as MatchStatus[]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {kind === "cricket" && (
                <div className="grid gap-2">
                  <input placeholder="A runs/wkts/overs (e.g., 120/3/18.2)" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-sm" onChange={(ev) => {
                    const [runs, wk, ov] = ev.target.value.split("/");
                    setCricketA(m, { runs: Number(runs) || 0, wickets: Number(wk) || 0, overs: Number(ov) || 0 });
                  }} />
                  <input placeholder="B runs/wkts/overs" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-sm" onChange={(ev) => {
                    const [runs, wk, ov] = ev.target.value.split("/");
                    setCricketB(m, { runs: Number(runs) || 0, wickets: Number(wk) || 0, overs: Number(ov) || 0 });
                  }} />
                  <input placeholder="A top batters (Name:Runs,Name:Runs)" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-sm" onChange={(ev) => {
                    const top = ev.target.value.split(",").map(s => s.trim()).filter(Boolean).map(s => { const [name, runs] = s.split(":"); return { name: name?.trim() || "", runs: Number(runs) || 0 }; });
                    setCricketA(m, { topBatters: top.slice(0,2) });
                  }} />
                  <input placeholder="B top batters (Name:Runs,Name:Runs)" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-sm" onChange={(ev) => {
                    const top = ev.target.value.split(",").map(s => s.trim()).filter(Boolean).map(s => { const [name, runs] = s.split(":"); return { name: name?.trim() || "", runs: Number(runs) || 0 }; });
                    setCricketB(m, { topBatters: top.slice(0,2) });
                  }} />
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Best bowler A (Name:Wkts)" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-sm" onChange={(ev) => {
                      const [name, wk] = ev.target.value.split(":");
                      setCricketA(m, { bestBowler: { name: (name || "").trim(), wickets: Number(wk) || 0 } });
                    }} />
                    <input placeholder="Best bowler B (Name:Wkts)" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-sm" onChange={(ev) => {
                      const [name, wk] = ev.target.value.split(":");
                      setCricketB(m, { bestBowler: { name: (name || "").trim(), wickets: Number(wk) || 0 } });
                    }} />
                  </div>
                  <input placeholder="External live URL (optional)" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-sm" onChange={(ev) => {
                    setCricket(m, { externalLiveUrl: ev.target.value || undefined });
                  }} />
                </div>
              )}

              {kind === "football" && (
                <div className="grid gap-2">
                  <input placeholder="A goals" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-sm" onChange={(ev) => {
                    const a = Number(ev.target.value) || 0;
                    setFootball(m, { aGoals: a });
                  }} />
                  <input placeholder="B goals" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-sm" onChange={(ev) => {
                    const b = Number(ev.target.value) || 0;
                    setFootball(m, { bGoals: b });
                  }} />
                  <input placeholder="Timeline comma-separated (min-team-scorer[-assist]) e.g., 12-A-John,45-B-Ram-Vik" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-xs" onChange={(ev) => {
                    const timeline: FootballGoal[] = ev.target.value.split(",").map(s => s.trim()).filter(Boolean).map(s => {
                      const [min, team, scorer, assist] = s.split("-");
                      const t = team === "A" ? "A" : "B" as const;
                      const base: any = { minute: Number(min) || 0, team: t, scorer: (scorer||"").trim() };
                      if (assist && assist.trim()) base.assist = assist.trim();
                      return base as FootballGoal;
                    });
                    setFootball(m, { timeline });
                  }} />
                </div>
              )}

              {kind === "volleyball" && (
                <div className="grid gap-2">
                  <input placeholder="Sets (e.g., 25-22,22-25,15-13)" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-sm" onChange={(ev) => {
                    const sets: VolleyballSet[] = ev.target.value.split(",").map((s) => s.trim()).filter(Boolean).map((s) => { const [a, b] = s.split("-").map((x) => Number(x) || 0); return { a, b }; });
                    setVolleyball(m, { sets });
                  }} />
                </div>
              )}

              {kind === "other" && (
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="A score" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-sm" onChange={(ev) => {
                    const aScore = Number(ev.target.value) || 0;
                    const curr = getOther(m) as { aScore?: number; bScore?: number; note?: string };
                    setField(m.id, { score: { kind: "other", data: { ...curr, aScore } } });
                  }} />
                  <input placeholder="B score" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-sm" onChange={(ev) => {
                    const bScore = Number(ev.target.value) || 0;
                    const curr = getOther(m) as { aScore?: number; bScore?: number; note?: string };
                    setField(m.id, { score: { kind: "other", data: { ...curr, bScore } } });
                  }} />
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  disabled={savingIds.has(m.id)}
                  className="rounded-full bg-brand-lime hover:bg-brand-limeDark disabled:bg-brand-lime/60 text-brand-charcoal font-semibold px-4 py-1.5 text-sm inline-flex items-center gap-2"
                  onClick={async () => {
                    const e = editing[m.id]; if (!e) return;
                    try {
                      setSavingIds((s) => new Set(s).add(m.id));
                      await updateMatch(m.id, { status: e.status, score: e.score });
                      showToast("Match updated", "success");
                      await refreshMatches();
                    } catch(error) {
                      console.error("Error updating match:", error);
                      showToast("Failed to update match", "error");
                    } finally {
                      setSavingIds((s) => { const n = new Set(s); n.delete(m.id); return n; });
                    }
                  }}
                >
                  {savingIds.has(m.id) && <TailSpin color="#84cc16" height={16} width={16} />}Save
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}
