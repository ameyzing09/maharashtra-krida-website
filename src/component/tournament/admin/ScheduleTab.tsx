import { useMemo, useState } from "react";
import type { EventTeam, ID, NewMatch, Team } from "../../../types/tournament";
import { createMatch } from "../../../services/matchService";
import { listEventTeams, upsertEventTeam } from "../../../services/eventTeamService";
import { parseScheduleXlsx, type ParsedSchedule } from "../../../tournament/importers/xlsxSchedule";
import { createTeam } from "../../../services/teamService";
import useToast from "../../../hook/useToast";
import Toast from "../../common/Toast";
import { TailSpin } from "react-loader-spinner";

type Props = {
  eventId: ID;
  teams: Team[];
  eventTeams: EventTeam[];
  refreshMatches: () => Promise<void>;
};

export default function ScheduleTab({ eventId, teams, eventTeams, refreshMatches }: Props) {
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [venue, setVenue] = useState("");
  const [importRows, setImportRows] = useState<ParsedSchedule[] | null>(null);
  const [missingNames, setMissingNames] = useState<string[]>([]);
  const [creatingMatch, setCreatingMatch] = useState(false);
  const [creatingMissing, setCreatingMissing] = useState(false);
  const [creatingBulk, setCreatingBulk] = useState(false);
  const { toast, showToast } = useToast();

  const allowedTeams = useMemo(() => eventTeams.map((et) => teams.find((t) => t.id === et.teamId)).filter((t): t is Team => !!t), [eventTeams, teams]);

  const toEpoch = (val: string) => (val ? new Date(val).getTime() : Date.now());

  return (
    <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate p-4 max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} />}
      <h2 className="font-semibold mb-3">Create Fixture</h2>
      <div className="grid gap-2">
        <select className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2" value={teamAId} onChange={(e) => setTeamAId(e.target.value)}>
          <option value="">Team A</option>
          {allowedTeams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2" value={teamBId} onChange={(e) => setTeamBId(e.target.value)}>
          <option value="">Team B</option>
          {allowedTeams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <input type="datetime-local" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        <input type="text" placeholder="Venue" className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2" value={venue} onChange={(e) => setVenue(e.target.value)} />
        <button
          disabled={creatingMatch}
          className="rounded-full bg-brand-lime hover:bg-brand-limeDark disabled:bg-brand-lime/60 text-brand-charcoal font-semibold px-4 py-2 inline-flex items-center gap-2"
          onClick={async () => {
            if (!teamAId || !teamBId) return;
            try {
              setCreatingMatch(true);
              const payload: NewMatch = { eventId, teamAId, teamBId, scheduledAt: toEpoch(scheduledAt), venue: venue || undefined, status: "upcoming" };
              await createMatch(payload);
              showToast("Match created", "success");
              setTeamAId(""); setTeamBId(""); setScheduledAt(""); setVenue("");
              await refreshMatches();
            } catch {
              showToast("Failed to create match", "error");
            } finally {
              setCreatingMatch(false);
            }
          }}
        >
          {creatingMatch && <TailSpin color="#84cc16" height={16} width={16} />}Create Match
        </button>
      </div>

      <h3 className="font-semibold mt-6 mb-2">Import from Excel (.xlsx)</h3>
      <input
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          let parsed: ParsedSchedule[] = [];
          try {
            parsed = await parseScheduleXlsx(file);
            setImportRows(parsed);
            showToast(`Parsed ${parsed.length} rows`, "success");
          } catch {
            showToast("Failed to parse Excel", "error");
          }
          const names = new Set<string>();
          const allowedNames = new Map<string, string>();
          for (const t of allowedTeams) {
            allowedNames.set(t.name.toLowerCase(), t.id);
            if (t.short) allowedNames.set(t.short.toLowerCase(), t.id);
          }
          for (const r of parsed) {
            if (!allowedNames.has(r.teamA.toLowerCase())) names.add(r.teamA);
            if (!allowedNames.has(r.teamB.toLowerCase())) names.add(r.teamB);
          }
          setMissingNames(Array.from(names));
        }}
      />

      {importRows && (
        <div className="mt-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">Parsed {importRows.length} rows. Missing teams in this event: {missingNames.length}.</p>
          {missingNames.length > 0 && (
            <button
              disabled={creatingMissing}
              className="mt-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-brand-charcoal dark:text-gray-100 px-4 py-1.5 text-sm inline-flex items-center gap-2"
              onClick={async () => {
                try {
                  setCreatingMissing(true);
                  const nameToId = new Map<string, string>();
                  for (const t of teams) {
                    nameToId.set(t.name.toLowerCase(), t.id);
                    if (t.short) nameToId.set(t.short.toLowerCase(), t.id);
                  }
                  for (const name of missingNames) {
                    const key = name.toLowerCase();
                    let id = nameToId.get(key);
                    if (!id) id = await createTeam({ name });
                    await upsertEventTeam({ eventId, teamId: id });
                  }
                  const ets = await listEventTeams(eventId);
                  const allowedNow = ets.map((et) => teams.find((t) => t.id === et.teamId)).filter((t): t is Team => !!t);
                  const newMissing = new Set<string>();
                  const allowedMap = new Map<string, string>();
                  for (const t of allowedNow) {
                    allowedMap.set(t.name.toLowerCase(), t.id);
                    if (t.short) allowedMap.set(t.short.toLowerCase(), t.id);
                  }
                  for (const r of importRows) {
                    if (!allowedMap.has(r.teamA.toLowerCase())) newMissing.add(r.teamA);
                    if (!allowedMap.has(r.teamB.toLowerCase())) newMissing.add(r.teamB);
                  }
                  setMissingNames(Array.from(newMissing));
                  showToast("Missing teams resolved", "success");
                } catch {
                  showToast("Failed to resolve missing teams", "error");
                } finally {
                  setCreatingMissing(false);
                }
              }}
            >
              {creatingMissing && <TailSpin color="#84cc16" height={16} width={16} />}Create missing teams and add to event
            </button>
          )}

          <button
            className="mt-2 ml-2 rounded-full bg-brand-lime hover:bg-brand-limeDark text-brand-charcoal font-semibold px-4 py-1.5 text-sm disabled:opacity-60 inline-flex items-center gap-2"
            disabled={missingNames.length > 0 || creatingBulk}
            onClick={async () => {
              try {
                setCreatingBulk(true);
                const ets = await listEventTeams(eventId);
                const allowedNow = ets.map((et) => teams.find((t) => t.id === et.teamId)).filter((t): t is Team => !!t);
                const allowedMap = new Map<string, string>();
                for (const t of allowedNow) {
                  allowedMap.set(t.name.toLowerCase(), t.id);
                  if (t.short) allowedMap.set(t.short.toLowerCase(), t.id);
                }
                for (const r of importRows) {
                  const aId = allowedMap.get(r.teamA.toLowerCase());
                  const bId = allowedMap.get(r.teamB.toLowerCase());
                  if (!aId || !bId) continue;
                  const payload: NewMatch = { eventId, teamAId: aId, teamBId: bId, scheduledAt: r.scheduledAt, venue: r.venue, status: r.status };
                  await createMatch(payload);
                }
                setImportRows(null);
                setMissingNames([]);
                showToast("Matches created", "success");
                await refreshMatches();
              } catch {
                showToast("Failed to create matches", "error");
              } finally {
                setCreatingBulk(false);
              }
            }}
          >
            {creatingBulk && <TailSpin color="#84cc16" height={16} width={16} />}Create Matches ({importRows?.length ?? 0})
          </button>
        </div>
      )}
    </div>
  );
}

