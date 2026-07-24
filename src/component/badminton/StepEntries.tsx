import { useMemo, useState } from "react";
import { useBadmintonRegistration } from "../../hook/useBadmintonRegistration";
import {
  BADMINTON_CATEGORIES,
  BadmintonCategory,
  CATEGORY_BY_CODE,
  formatINR,
  isTeamEvent,
  playerBounds,
} from "../../constants/badminton";
import { CategoryEntry, Player } from "../../types/badminton";

const input = "glass-input w-full px-3 py-2";
const labelCls = "text-xs font-medium text-gray-600 dark:text-gray-300 mb-1";

const PERSONAL_DOMAIN = /gmail|yahoo|outlook|hotmail/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyPlayer(): Player {
  return { name: "", phone: "", officialEmail: "", personalEmail: "", designation: "" };
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function StepEntries() {
  const { state, dispatch } = useBadmintonRegistration();

  const [category, setCategory] = useState<BadmintonCategory>("mens_singles");
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<Player[]>([emptyPlayer()]);
  const [captainIndex, setCaptainIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const meta = CATEGORY_BY_CODE[category];
  const bounds = playerBounds(category);
  const team = isTeamEvent(category);

  const total = useMemo(
    () => state.entries.reduce((sum, e) => sum + CATEGORY_BY_CODE[e.category].fee, 0),
    [state.entries]
  );

  function resetBuilder(next: BadmintonCategory) {
    const b = playerBounds(next);
    setCategory(next);
    setPlayers(Array.from({ length: b.min }, emptyPlayer));
    setCaptainIndex(0);
    setTeamName("");
    setError(null);
  }

  function updatePlayer(idx: number, patch: Partial<Player>) {
    setPlayers((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  function addPlayerRow() {
    if (players.length >= bounds.max) return;
    setPlayers((prev) => [...prev, emptyPlayer()]);
  }

  function removePlayerRow(idx: number) {
    if (players.length <= bounds.min) return;
    setPlayers((prev) => prev.filter((_, i) => i !== idx));
    setCaptainIndex((ci) => (ci >= idx && ci > 0 ? ci - 1 : ci));
  }

  function useContactForFirst() {
    const org = state.organization;
    if (!org) return;
    updatePlayer(0, {
      name: org.contactPersonName,
      phone: org.phone,
      officialEmail: org.officialEmail,
      personalEmail: org.personalEmail || "",
    });
  }

  function validate(): string | null {
    if (team && teamName.trim().length < 2) return "Enter a team name.";
    if (players.length < bounds.min || players.length > bounds.max) {
      return `This category needs ${
        bounds.min === bounds.max ? bounds.min : `${bounds.min}–${bounds.max}`
      } player(s).`;
    }
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const who = players.length > 1 ? `Player ${i + 1}` : "Player";
      if (p.name.trim().length < 2) return `${who}: enter a name.`;
      if (!/^[0-9]{10}$/.test(p.phone.trim())) return `${who}: enter a valid 10-digit phone.`;
      if (!EMAIL_RE.test(p.officialEmail.trim())) return `${who}: enter a valid official email.`;
      if (PERSONAL_DOMAIN.test(p.officialEmail)) return `${who}: use an official email, not personal.`;
      if (p.personalEmail && p.personalEmail.trim() && !EMAIL_RE.test(p.personalEmail.trim()))
        return `${who}: personal email is invalid.`;
    }
    return null;
  }

  function addEntry() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    const entry: CategoryEntry = {
      id: makeId(),
      category,
      players: players.map((p) => ({
        name: p.name.trim(),
        phone: p.phone.trim(),
        officialEmail: p.officialEmail.trim(),
        personalEmail: p.personalEmail?.trim() || undefined,
        designation: p.designation?.trim() || undefined,
      })),
      ...(team ? { teamName: teamName.trim(), captainIndex } : {}),
    };
    dispatch({ type: "ADD_ENTRY", payload: entry });
    resetBuilder(category);
  }

  return (
    <div className="space-y-6">
      {/* Added entries */}
      {state.entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Your entries ({state.entries.length})
          </h3>
          {state.entries.map((e) => {
            const em = CATEGORY_BY_CODE[e.category];
            return (
              <div key={e.id} className="glass-panel-subtle p-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {em.label}
                    {e.teamName ? ` — ${e.teamName}` : ""}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                    {e.players.map((p) => p.name).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium text-brand-lime">{formatINR(em.fee)}</span>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "REMOVE_ENTRY", payload: e.id })}
                    className="text-xs text-red-600 hover:underline"
                    aria-label={`Remove ${em.label}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Subtotal</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{formatINR(total)}</span>
          </div>
        </div>
      )}

      {/* Builder */}
      <div className="glass-panel p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Add an entry</h3>

        <div className="flex flex-col">
          <label className={labelCls}>Category</label>
          <select
            className={input}
            value={category}
            onChange={(e) => resetBuilder(e.target.value as BadmintonCategory)}
          >
            {BADMINTON_CATEGORIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label} — {formatINR(c.fee)} {c.unit}
              </option>
            ))}
          </select>
          {meta.note && <p className="text-[11px] text-gray-500 mt-1">{meta.note}</p>}
        </div>

        {team && (
          <div className="flex flex-col">
            <label className={labelCls}>Team Name</label>
            <input
              className={input}
              placeholder="Acme Smashers"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>
        )}

        {state.organization && (
          <button
            type="button"
            onClick={useContactForFirst}
            className="text-xs text-brand-lime hover:underline"
          >
            Use primary contact details for Player 1
          </button>
        )}

        <div className="space-y-4">
          {players.map((p, idx) => (
            <div key={idx} className="rounded-xl border border-black/5 dark:border-white/10 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {players.length > 1 ? `Player ${idx + 1}` : "Player"}
                </span>
                <div className="flex items-center gap-3">
                  {team && (
                    <label className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                      <input
                        type="radio"
                        name="captain"
                        checked={captainIndex === idx}
                        onChange={() => setCaptainIndex(idx)}
                      />
                      Captain
                    </label>
                  )}
                  {players.length > bounds.min && (
                    <button
                      type="button"
                      onClick={() => removePlayerRow(idx)}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:gap-3">
                <div className="flex-1 flex flex-col mb-3 sm:mb-0">
                  <label className={labelCls}>Full Name</label>
                  <input
                    className={input}
                    placeholder="Player name"
                    value={p.name}
                    onChange={(e) => updatePlayer(idx, { name: e.target.value })}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className={labelCls}>Mobile Number</label>
                  <input
                    className={input}
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={p.phone}
                    onChange={(e) => updatePlayer(idx, { phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:gap-3">
                <div className="flex-1 flex flex-col mb-3 sm:mb-0">
                  <label className={labelCls}>Official Email</label>
                  <input
                    className={input}
                    type="email"
                    placeholder="player@company.com"
                    value={p.officialEmail}
                    onChange={(e) => updatePlayer(idx, { officialEmail: e.target.value })}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className={labelCls}>
                    Designation <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    className={input}
                    placeholder="Employee ID / Role"
                    value={p.designation}
                    onChange={(e) => updatePlayer(idx, { designation: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {team && players.length < bounds.max && (
          <button type="button" onClick={addPlayerRow} className="text-xs text-brand-lime hover:underline">
            + Add player ({players.length}/{bounds.max})
          </button>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button type="button" onClick={addEntry} className="glass-button-outline px-5 py-2 text-sm">
          Add entry — {formatINR(meta.fee)}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "BACK" })}
          className="rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-brand-charcoal dark:text-gray-100 font-medium py-2 px-4"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "NEXT" })}
          disabled={state.entries.length === 0}
          className="glass-button-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
