import { useState } from "react";
import type { ID, Team } from "../../../types/tournament";
import { createTeam, deleteTeam, updateTeam } from "../../../services/teamService";
import { upsertEventTeam } from "../../../services/eventTeamService";
import { parseTeamsXlsx, type ParsedTeamRow } from "../../../tournament/importers/xlsxTeams";
import useToast from "../../../hook/useToast";
import Toast from "../../common/Toast";
import { TailSpin } from "react-loader-spinner";

type Props = {
  teams: Team[];
  refreshTeams: () => Promise<void>;
  eventId: ID;
  refreshEventTeams: () => Promise<void>;
};

export default function TeamsTab({ teams, refreshTeams, eventId, refreshEventTeams }: Props) {
  const [name, setName] = useState("");
  const [short, setShort] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [ovShort, setOvShort] = useState("");
  const [ovLogo, setOvLogo] = useState("");
  const [seed, setSeed] = useState<string>("");
  const [group, setGroup] = useState("");
  const [importTeamRows, setImportTeamRows] = useState<ParsedTeamRow[] | null>(null);
  const [alsoAddToEvent, setAlsoAddToEvent] = useState(true);

  const { toast, showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [teamActionId, setTeamActionId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Left: Create / Import */}
      <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate p-4">
        <h2 className="font-semibold mb-3">Create Team</h2>
        <div className="grid gap-2">
          <input className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2" placeholder="Team name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2" placeholder="Short (optional)" value={short} onChange={(e) => setShort(e.target.value)} />
          <input className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2" placeholder="Logo URL (optional)" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
          <div className="flex gap-2">
            <button
              disabled={creating}
              className="rounded-full bg-brand-lime hover:bg-brand-limeDark disabled:bg-brand-lime/60 text-brand-charcoal font-semibold px-4 py-2 inline-flex items-center gap-2"
              onClick={async () => {
                if (!name.trim()) return;
                try {
                  setCreating(true);
                  await createTeam({ name, short: short || undefined, logoUrl: logoUrl || undefined });
                  showToast("Team created", "success");
                  setName(""); setShort(""); setLogoUrl("");
                  await refreshTeams();
                } catch {
                  showToast("Failed to create team", "error");
                } finally {
                  setCreating(false);
                }
              }}
            >
              {creating && <TailSpin color="#84cc16" height={16} width={16} />}Create
            </button>
          </div>
        </div>

        <h3 className="font-semibold mt-6 mb-2">All Teams</h3>
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {teams.map((t) => (
            <li key={t.id} className="py-2 flex items-center justify-between">
              <span className="text-sm">{t.name}</span>
              <div className="flex gap-2">
                <button
                  disabled={teamActionId === t.id}
                  className="text-xs rounded bg-black/5 dark:bg-white/10 px-2 py-1 inline-flex items-center gap-1"
                  onClick={async () => {
                    try {
                      setTeamActionId(t.id);
                      await updateTeam(t.id, { name: t.name });
                      showToast("Team updated", "success");
                      await refreshTeams();
                    } catch {
                      showToast("Failed to update team", "error");
                    } finally {
                      setTeamActionId(null);
                    }
                  }}
                >
                  {teamActionId === t.id && <TailSpin color="#84cc16" height={14} width={14} />}Save
                </button>
                <button
                  disabled={teamActionId === t.id}
                  className="text-xs rounded bg-red-500 text-white px-2 py-1 inline-flex items-center gap-1"
                  onClick={async () => {
                    try {
                      setTeamActionId(t.id);
                      await deleteTeam(t.id);
                      showToast("Team deleted", "success");
                      await refreshTeams();
                    } catch {
                      showToast("Failed to delete team", "error");
                    } finally {
                      setTeamActionId(null);
                    }
                  }}
                >
                  {teamActionId === t.id && <TailSpin color="#fff" height={14} width={14} />}Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        <h3 className="font-semibold mt-6 mb-2">Import Teams from Excel (.xlsx)</h3>
        <input
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              setImporting(true);
              const rows = await parseTeamsXlsx(file);
              setImportTeamRows(rows);
              showToast(`Parsed ${rows.length} rows`, "success");
            } catch {
              showToast("Failed to parse Excel", "error");
            } finally {
              setImporting(false);
            }
          }}
        />
        {importTeamRows && (
          <div className="mt-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" checked={alsoAddToEvent} onChange={(e) => setAlsoAddToEvent(e.target.checked)} />
              Also add to this event (use Short/Logo as overrides, apply Group/Seed)
            </label>
            <div className="mt-2 flex gap-2">
              <button
                disabled={importing}
                className="rounded-full bg-brand-lime hover:bg-brand-limeDark disabled:bg-brand-lime/60 text-brand-charcoal font-semibold px-4 py-1.5 text-sm inline-flex items-center gap-2"
                onClick={async () => {
                  if (!importTeamRows) return;
                  try {
                    setImporting(true);
                    // Build lookup for existing teams
                    const byKey = new Map<string, Team>();
                    for (const t of teams) {
                      byKey.set(t.name.toLowerCase(), t);
                      if (t.short) byKey.set(t.short.toLowerCase(), t);
                    }
                    for (const row of importTeamRows) {
                      const keyName = row.name.toLowerCase();
                      const keyShort = row.short?.toLowerCase();
                      let t = byKey.get(keyName) || (keyShort ? byKey.get(keyShort) : undefined);
                      if (!t) {
                        const id = await createTeam({ name: row.name, short: row.short, logoUrl: row.logoUrl });
                        t = { id, name: row.name, short: row.short, logoUrl: row.logoUrl };
                        byKey.set(keyName, t);
                        if (keyShort) byKey.set(keyShort, t);
                      } else {
                        // update short/logo if provided (optional)
                        const patch: Partial<{ name: string; short?: string; logoUrl?: string }> = {};
                        if (row.short && row.short !== t.short) patch.short = row.short;
                        if (row.logoUrl && row.logoUrl !== t.logoUrl) patch.logoUrl = row.logoUrl;
                        if (Object.keys(patch).length) await updateTeam(t.id, patch);
                      }
                      if (alsoAddToEvent && t) {
                        await upsertEventTeam({ eventId, teamId: t.id, short: row.short, logoOverride: row.logoUrl, group: row.group, seed: row.seed });
                      }
                    }
                    setImportTeamRows(null);
                    showToast("Teams imported", "success");
                    await refreshTeams();
                    if (alsoAddToEvent) await refreshEventTeams();
                  } catch {
                    showToast("Failed to import teams", "error");
                  } finally {
                    setImporting(false);
                  }
                }}
              >
                {importing && <TailSpin color="#84cc16" height={16} width={16} />}Create/Upsert Teams ({importTeamRows.length})
              </button>
              <button className="rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-brand-charcoal dark:text-gray-100 px-4 py-1.5 text-sm" onClick={() => setImportTeamRows(null)}>
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Add Override */}
      <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate p-4">
        <h2 className="font-semibold mb-3">Add Override to Event</h2>
        <select className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 mb-2 w-full" value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
          <option value="">Select team…</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="grid gap-2">
          <input className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2" placeholder="Override short (optional)" value={ovShort} onChange={(e) => setOvShort(e.target.value)} />
          <input className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2" placeholder="Logo override URL (optional)" value={ovLogo} onChange={(e) => setOvLogo(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2" placeholder="Seed" value={seed} onChange={(e) => setSeed(e.target.value)} />
            <input className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2" placeholder="Group" value={group} onChange={(e) => setGroup(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-full bg-brand-lime hover:bg-brand-limeDark text-brand-charcoal font-semibold px-4 py-2"
              onClick={async () => {
                if (!selectedTeamId) return;
                await upsertEventTeam({ eventId, teamId: selectedTeamId, short: ovShort || undefined, logoOverride: ovLogo || undefined, seed: seed ? Number(seed) : undefined, group: group || undefined });
                setSelectedTeamId(""); setOvShort(""); setOvLogo(""); setSeed(""); setGroup("");
                await refreshEventTeams();
              }}
            >
              Add / Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
