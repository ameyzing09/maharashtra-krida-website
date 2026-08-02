import type { ScoreCardData } from "../../types/tournament";
import { formatDateTimePretty } from "../../utils/date";

type Props = { data: ScoreCardData };

function TeamBadge({ name, short, logoUrl }: { name: string; short?: string; logoUrl?: string }) {
  return (
    <div className="flex items-center gap-2">
      {logoUrl ? (
        <img src={logoUrl} alt={name} className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800" />
      )}
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{name}</span>
        {short && <span className="text-xs text-slate-500 dark:text-slate-400">{short}</span>}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ScoreCardData["status"] }) {
  const map: Record<ScoreCardData["status"], string> = {
    upcoming: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900",
    live: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${map[status]}`}>
      {status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden />}
      {status.toUpperCase()}
    </span>
  );
}

export default function ScoreCard({ data }: Props) {
  const abbr = (name: string, short?: string) => {
    if (short && short.trim()) return short.trim().toUpperCase();
    const letters = name
      .split(/\s+/)
      .map((w) => (w && w[0]) || "")
      .join("")
      .slice(0, 3)
      .toUpperCase();
    return letters || name.slice(0, 3).toUpperCase();
  };
  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{data.tournamentTitle}</h3>
        <StatusPill status={data.status} />
      </header>

      {data.kind === "football" ? (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center gap-2">
            {data.teamA.logoUrl ? (
              <img src={data.teamA.logoUrl} alt={data.teamA.name} className="h-5 w-5 rounded object-cover" />
            ) : (
              <div className="h-5 w-5 rounded bg-slate-100 dark:bg-slate-800" />
            )}
            <span className="text-sm text-slate-900 dark:text-slate-100">{abbr(data.teamA.name, data.teamA.short)}</span>
          </div>
          <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {typeof data.score?.aGoals === "number" && typeof data.score?.bGoals === "number"
              ? `${data.score.aGoals} - ${data.score.bGoals}`
              : "-"}
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-sm text-slate-900 dark:text-slate-100">{abbr(data.teamB.name, data.teamB.short)}</span>
            {data.teamB.logoUrl ? (
              <img src={data.teamB.logoUrl} alt={data.teamB.name} className="h-5 w-5 rounded object-cover" />
            ) : (
              <div className="h-5 w-5 rounded bg-slate-100 dark:bg-slate-800" />
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <TeamBadge {...data.teamA} />
          <div className="text-center min-w-[90px]">
          {data.kind === "cricket" && (
            <div className="text-sm text-slate-900 dark:text-slate-100">
              <div className="font-semibold tabular-nums">
                {data.score ? `${data.score.a.runs}/${data.score.a.wickets} • ${data.score.a.overs} ov` : "-"}
              </div>
              <div className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {data.score ? `${data.score.b.runs}/${data.score.b.wickets} • ${data.score.b.overs} ov` : "-"}
              </div>
            </div>
          )}
          {data.kind === "volleyball" && (
            <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {data.score ? `${data.score.sets.reduce((a, s) => a + (s.a > s.b ? 1 : 0), 0)} - ${data.score.sets.reduce((a, s) => a + (s.b > s.a ? 1 : 0), 0)}` : "-"}
            </div>
          )}
          {data.kind === "other" && (
            <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {data.score ? `${data.score.aScore ?? "-"} - ${data.score.bScore ?? "-"}` : "-"}
            </div>
          )}
        </div>
        <TeamBadge {...data.teamB} />
      </div>
      )}

      <footer className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{formatDateTimePretty(data.scheduledAt)}</span>
        {data.venue && <span className="truncate max-w-[50%] text-right">{data.venue}</span>}
      </footer>

      {/* Details by sport */}
      {data.kind === "cricket" && data.score && (
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex justify-between gap-2">
            <div className="flex-1">
              {data.score.a.topBatters?.slice(0, 2).map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{b.name}</span>
                  <span className="font-medium tabular-nums">{b.runs}</span>
                </div>
              ))}
            </div>
            <div className="flex-1">
              {data.score.b.topBatters?.slice(0, 2).map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{b.name}</span>
                  <span className="font-medium tabular-nums">{b.runs}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Best Bowler A: {data.score.a.bestBowler ? `${data.score.a.bestBowler.name} (${data.score.a.bestBowler.wickets}w)` : "-"}</span>
            <span>Best Bowler B: {data.score.b.bestBowler ? `${data.score.b.bestBowler.name} (${data.score.b.bestBowler.wickets}w)` : "-"}</span>
          </div>
          {data.score.externalLiveUrl && (
            <a href={data.score.externalLiveUrl} target="_blank" rel="noopener noreferrer" className="text-slate-900 dark:text-slate-100 font-medium underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 dark:decoration-slate-600 dark:hover:decoration-slate-400">Live details</a>
          )}
        </div>
      )}

      {/* Football goal-by-goal details hidden on compact cards for readability */}

      {data.kind === "volleyball" && data.score && (
        <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-1">
          {data.score.sets.map((s, i) => (
            <span key={i} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono dark:border-slate-700 dark:bg-slate-800">Set {i + 1}: {s.a}-{s.b}</span>
          ))}
        </div>
      )}
    </article>
  );
}
