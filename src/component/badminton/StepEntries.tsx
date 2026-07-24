import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useBadmintonRegistration } from "../../hook/useBadmintonRegistration";
import {
  BADMINTON_CATEGORIES,
  BadmintonCategory,
  CATEGORY_BY_CODE,
  formatINR,
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
  const reduceMotion = useReducedMotion();

  const [selected, setSelected] = useState<BadmintonCategory | null>(null);
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);

  const hasTeamEntry = state.entries.some((e) => CATEGORY_BY_CODE[e.category].exclusive);
  const hasIndividualEntry = state.entries.some((e) => !CATEGORY_BY_CODE[e.category].exclusive);

  const total = useMemo(
    () => state.entries.reduce((sum, e) => sum + CATEGORY_BY_CODE[e.category].fee, 0),
    [state.entries]
  );

  const meta = selected ? CATEGORY_BY_CODE[selected] : null;

  function isDisabled(code: BadmintonCategory): boolean {
    const m = CATEGORY_BY_CODE[code];
    // A team entry locks the whole registration; individual entries lock team.
    if (hasTeamEntry) return true;
    if (m.exclusive && hasIndividualEntry) return true;
    return false;
  }

  function selectCategory(code: BadmintonCategory) {
    if (isDisabled(code)) return;
    if (selected === code) {
      closeForm();
      return;
    }
    const m = CATEGORY_BY_CODE[code];
    setSelected(code);
    setPlayers(m.collectsPlayers ? Array.from({ length: playerBounds(code).min }, emptyPlayer) : []);
    setTeamName("");
    setError(null);
  }

  function closeForm() {
    setSelected(null);
    setPlayers([]);
    setTeamName("");
    setError(null);
  }

  function updatePlayer(idx: number, patch: Partial<Player>) {
    setPlayers((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  function useContactForFirst() {
    const org = state.organization;
    if (!org || players.length === 0) return;
    updatePlayer(0, {
      name: org.contactPersonName,
      phone: org.phone,
      officialEmail: org.officialEmail,
      personalEmail: org.personalEmail || "",
    });
  }

  function validate(): string | null {
    if (!meta) return "Pick a category.";
    if (!meta.collectsPlayers) {
      if (teamName.trim().length < 2) return "Enter a team name.";
      return null;
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
    if (!selected || !meta) return;
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    const entry: CategoryEntry = {
      id: makeId(),
      category: selected,
      players: players.map((p) => ({
        name: p.name.trim(),
        phone: p.phone.trim(),
        officialEmail: p.officialEmail.trim(),
        personalEmail: p.personalEmail?.trim() || undefined,
        designation: p.designation?.trim() || undefined,
      })),
      ...(meta.collectsPlayers ? {} : { teamName: teamName.trim() }),
    };
    dispatch({ type: "ADD_ENTRY", payload: entry });
    closeForm();
  }

  const listAnim = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: 24 },
        transition: { duration: 0.2 },
      };

  const formAnim = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
        transition: { duration: 0.25 },
      };

  return (
    <div className="space-y-6">
      {/* Added entries */}
      <AnimatePresence initial={false}>
        {state.entries.length > 0 && (
          <motion.div key="entries-list" className="space-y-2" {...(reduceMotion ? {} : { layout: true })}>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Your entries ({state.entries.length})
            </h3>
            <AnimatePresence initial={false}>
              {state.entries.map((e) => {
                const em = CATEGORY_BY_CODE[e.category];
                return (
                  <motion.div
                    key={e.id}
                    {...listAnim}
                    className="glass-panel-subtle p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {em.label}
                        {e.teamName ? ` — ${e.teamName}` : ""}
                      </p>
                      {e.players.length > 0 && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 truncate">
                          {e.players.map((p) => p.name).join(", ")}
                        </p>
                      )}
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
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Subtotal</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{formatINR(total)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category cards */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          {state.entries.length > 0 ? "Add another category" : "Choose a category"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BADMINTON_CATEGORIES.map((c) => {
            const disabled = isDisabled(c.code);
            const active = selected === c.code;
            return (
              <motion.button
                key={c.code}
                type="button"
                onClick={() => selectCategory(c.code)}
                disabled={disabled}
                aria-pressed={active}
                {...(reduceMotion || disabled ? {} : { whileHover: { y: -2 }, whileTap: { scale: 0.97 } })}
                className={[
                  "glass-panel p-3 sm:p-4 text-left transition-all duration-200",
                  active ? "ring-2 ring-brand-lime shadow-lg" : "",
                  disabled ? "opacity-40 cursor-not-allowed" : "glass-hover cursor-pointer",
                ].join(" ")}
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{c.label}</p>
                <p className="text-brand-lime font-bold text-base mt-1">{formatINR(c.fee)}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {Array.isArray(c.players) ? `${c.players[0]}–${c.players[1]} players` : c.players === 1 ? "1 player" : `${c.players} players`}
                  {" · "}
                  {c.unit}
                </p>
              </motion.button>
            );
          })}
        </div>
        {hasTeamEntry && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
            Corporate Team registrations cannot be combined with other entries. Remove the team entry
            to add individual categories.
          </p>
        )}
        {!hasTeamEntry && hasIndividualEntry && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
            The Corporate Team Event cannot be combined with individual entries — it needs a separate
            registration.
          </p>
        )}
      </div>

      {/* Focused entry form */}
      <AnimatePresence initial={false}>
        {selected && meta && (
          <motion.div key={selected} {...formAnim} className="overflow-hidden">
            <div className="glass-panel p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {meta.label} — {formatINR(meta.fee)}
                </h3>
                <button
                  type="button"
                  onClick={closeForm}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:underline shrink-0"
                >
                  Cancel
                </button>
              </div>
              {meta.note && <p className="text-[11px] text-gray-500 -mt-2">{meta.note}</p>}

              {!meta.collectsPlayers ? (
                <div className="flex flex-col">
                  <label className={labelCls}>Team Name</label>
                  <input
                    className={input}
                    placeholder="Acme Smashers"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
              ) : (
                <>
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
                      <div
                        key={idx}
                        className="rounded-xl border border-black/5 dark:border-white/10 p-3 space-y-3"
                      >
                        {players.length > 1 && (
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                            Player {idx + 1}
                          </span>
                        )}

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
                </>
              )}

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={addEntry}
                  className="glass-button-primary w-full sm:w-auto px-6 py-2.5"
                >
                  Add entry — {formatINR(meta.fee)}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="glass-button-secondary w-full sm:w-auto px-6 py-2.5 text-gray-800 dark:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "BACK" })}
          className="w-full sm:w-auto rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-brand-charcoal dark:text-gray-100 font-medium py-2.5 px-6"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "NEXT" })}
          disabled={state.entries.length === 0}
          className="glass-button-primary w-full sm:w-auto px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.entries.length > 0 ? `Continue — ${formatINR(total)}` : "Continue"}
        </button>
      </div>
    </div>
  );
}
