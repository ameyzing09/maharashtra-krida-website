import { useState } from "react";
import { useBadmintonRegistration } from "../../hook/useBadmintonRegistration";
import { CATEGORY_BY_CODE, formatINR } from "../../constants/badminton";

export default function StepReview() {
  const { state, dispatch } = useBadmintonRegistration();
  const [agreed, setAgreed] = useState(false);
  const org = state.organization;

  const total = state.entries.reduce((sum, e) => sum + CATEGORY_BY_CODE[e.category].fee, 0);

  return (
    <div className="space-y-6">
      {/* Organisation */}
      <div className="glass-panel-subtle p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Organisation</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div className="flex justify-between sm:block">
            <dt className="text-gray-500">Company</dt>
            <dd className="text-gray-900 dark:text-white font-medium">{org?.companyName}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-gray-500">Contact</dt>
            <dd className="text-gray-900 dark:text-white font-medium">{org?.contactPersonName}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-gray-500">Official Email</dt>
            <dd className="text-gray-900 dark:text-white font-medium break-all">{org?.officialEmail}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-gray-500">Phone</dt>
            <dd className="text-gray-900 dark:text-white font-medium">{org?.phone}</dd>
          </div>
        </dl>
      </div>

      {/* Entries */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Entries ({state.entries.length})
        </h3>
        {state.entries.map((e) => {
          const meta = CATEGORY_BY_CODE[e.category];
          return (
            <div key={e.id} className="glass-panel-subtle p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {meta.label}
                  {e.teamName ? ` — ${e.teamName}` : ""}
                </p>
                <span className="text-sm font-medium text-brand-lime">{formatINR(meta.fee)}</span>
              </div>
              <ul className="mt-1.5 space-y-0.5">
                {e.players.map((p, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-300">
                    {p.name}
                    {e.captainIndex === i ? " (Captain)" : ""} · {p.phone} · {p.officialEmail}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center border-t border-black/10 dark:border-white/10 pt-3">
        <span className="text-base font-semibold text-gray-700 dark:text-gray-200">Total payable</span>
        <span className="text-xl font-bold text-gray-900 dark:text-white">{formatINR(total)}</span>
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          className="mt-1"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>
          I understand that entry fees are <strong>strictly non-refundable</strong> and that once
          registered, entries cannot be cancelled or transferred. Registration is confirmed only on
          receipt of the entry fees.
        </span>
      </label>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-1">
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
          disabled={!agreed}
          className="glass-button-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}
