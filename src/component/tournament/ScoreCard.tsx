import type { ScoreCardData } from "../../types/tournament";
import { formatDateTimePretty } from "../../utils/date";

type Props = { data: ScoreCardData };

function TeamBadge({ name, short, logoUrl }: { name: string; short?: string; logoUrl?: string }) {
  return (
    <div className="flex items-center gap-2">
      {logoUrl ? (
        <img src={logoUrl} alt={name} className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-black/5 dark:bg-white/10" />
      )}
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-brand-charcoal dark:text-gray-100">{name}</span>
        {short && <span className="text-xs text-gray-600 dark:text-gray-400">{short}</span>}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ScoreCardData["status"] }) {
  const map: Record<ScoreCardData["status"], string> = {
    upcoming: "bg-blue-500",
    live: "bg-red-500",
    completed: "bg-green-600",
    cancelled: "bg-gray-500",
  };
  return <span className={`px-2 py-0.5 rounded-full text-white text-[11px] ${map[status]}`}>{status.toUpperCase()}</span>;
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
    <article className="glass glass-shine p-4 h-full flex flex-col">
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-brand-charcoal dark:text-gray-100 line-clamp-1">{data.tournamentTitle}</h3>
        <StatusPill status={data.status} />
      </header>

      {data.kind === "football" ? (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center gap-2">
            {data.teamA.logoUrl ? (
              <img src={data.teamA.logoUrl} alt={data.teamA.name} className="h-5 w-5 rounded object-cover" />
            ) : (
              <div className="h-5 w-5 rounded bg-black/5 dark:bg-white/10" />
            )}
            <span className="text-sm text-brand-charcoal dark:text-gray-100">{abbr(data.teamA.name, data.teamA.short)}</span>
          </div>
          <div className="text-xl font-bold text-brand-charcoal dark:text-gray-100">
            {typeof (data as any).score?.aGoals === "number" && typeof (data as any).score?.bGoals === "number"
              ? `${(data as any).score.aGoals} - ${(data as any).score.bGoals}`
              : "-"}
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-sm text-brand-charcoal dark:text-gray-100">{abbr(data.teamB.name, data.teamB.short)}</span>
            {data.teamB.logoUrl ? (
              <img src={data.teamB.logoUrl} alt={data.teamB.name} className="h-5 w-5 rounded object-cover" />
            ) : (
              <div className="h-5 w-5 rounded bg-black/5 dark:bg-white/10" />
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <TeamBadge {...data.teamA} />
          <div className="text-center min-w-[90px]">
          {data.kind === "cricket" && (
            <div className="text-sm text-brand-charcoal dark:text-gray-100">
              <div className="font-semibold">
                {data.score ? `${data.score.a.runs}/${data.score.a.wickets} �?� ${data.score.a.overs} ov` : "-"}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {data.score ? `${data.score.b.runs}/${data.score.b.wickets} �?� ${data.score.b.overs} ov` : "-"}
              </div>
            </div>
          )}
          {data.kind === "volleyball" && (
            <div className="text-sm font-semibold text-brand-charcoal dark:text-gray-100">
              {data.score ? `${data.score.sets.reduce((a, s) => a + (s.a > s.b ? 1 : 0), 0)} - ${data.score.sets.reduce((a, s) => a + (s.b > s.a ? 1 : 0), 0)}` : "-"}
            </div>
          )}
          {data.kind === "other" && (
            <div className="text-lg font-bold text-brand-charcoal dark:text-gray-100">
              {data.score ? `${data.score.aScore ?? "-"} - ${data.score.bScore ?? "-"}` : "-"}
            </div>
          )}
        </div>
        <TeamBadge {...data.teamB} />
      </div>
      )}

      <footer className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{formatDateTimePretty(data.scheduledAt)}</span>
        {data.venue && <span className="truncate max-w-[50%] text-right">{data.venue}</span>}
      </footer>

      {/* Details by sport */}
      {data.kind === "cricket" && data.score && (
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-700 dark:text-gray-300">
          <div className="flex justify-between gap-2">
            <div className="flex-1">
              {data.score.a.topBatters?.slice(0, 2).map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{b.name}</span>
                  <span className="font-medium">{b.runs}</span>
                </div>
              ))}
            </div>
            <div className="flex-1">
              {data.score.b.topBatters?.slice(0, 2).map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{b.name}</span>
                  <span className="font-medium">{b.runs}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Best Bowler A: {data.score.a.bestBowler ? `${data.score.a.bestBowler.name} (${data.score.a.bestBowler.wickets}w)` : "-"}</span>
            <span>Best Bowler B: {data.score.b.bestBowler ? `${data.score.b.bestBowler.name} (${data.score.b.bestBowler.wickets}w)` : "-"}</span>
          </div>
          {data.score.externalLiveUrl && (
            <a href={data.score.externalLiveUrl} target="_blank" rel="noopener noreferrer" className="text-brand-lime underline">Live details</a>
          )}
        </div>
      )}

      {data.kind === "volleyball" && data.score && (
        <div className="mt-3 text-xs text-gray-700 dark:text-gray-300 flex flex-wrap gap-1">
          {data.score.sets.map((s, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">Set {i + 1}: {s.a}-{s.b}</span>
          ))}
        </div>
      )}
    </article>
  );
}
