import { useRegistrationContext } from "../../hook/useRegistration";

export default function StepReview() {
  const { state, dispatch } = useRegistrationContext();
  const a = state.attendee;
  const amountPaise = state.priceBreakup?.registrationFee ?? 0;
  const amount = amountPaise / 100;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-brand-charcoal dark:text-white mb-4">Your Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-10 sm:gap-x-12 text-sm">
          <div className="grid grid-cols-[auto,1fr] items-baseline gap-x-4">
            <dt className="text-gray-500 dark:text-gray-400">Name</dt>
            <dd className="font-medium text-brand-charcoal dark:text-gray-100 break-words text-right">{a?.name}</dd>
          </div>
          <div className="grid grid-cols-[auto,1fr] items-baseline gap-x-4">
            <dt className="text-gray-500 dark:text-gray-400">Mobile</dt>
            <dd className="font-medium text-brand-charcoal dark:text-gray-100 text-right">{a?.phone}</dd>
          </div>
          <div className="grid grid-cols-[auto,1fr] items-baseline gap-x-4">
            <dt className="text-gray-500 dark:text-gray-400">Email</dt>
            <dd className="font-medium text-brand-charcoal dark:text-gray-100 break-all text-right">{a?.companyEmail}</dd>
          </div>
          {a?.other && (
            <div className="grid grid-cols-[auto,1fr] items-baseline gap-x-4 sm:col-span-2">
              <dt className="text-gray-500 dark:text-gray-400">Other</dt>
              <dd className="font-medium text-brand-charcoal dark:text-gray-100 break-words text-right">{a.other}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-brand-charcoal dark:text-white mb-3">Amount</h3>
        <div className="flex justify-between items-center text-base sm:text-lg">
          <span className="text-gray-600 dark:text-gray-300">Total</span>
          <span className="font-semibold text-brand-charcoal dark:text-white">
            {amount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <button
          onClick={() => dispatch({ type: "BACK" })}
          className="w-full sm:w-auto rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-brand-charcoal dark:text-gray-100 font-medium px-5 py-2.5"
        >
          Back
        </button>
        <button
          onClick={() => dispatch({ type: "NEXT" })}
          className="w-full sm:w-auto rounded-full border border-black/10 bg-brand-lime hover:bg-brand-limeDark text-brand-charcoal font-semibold px-6 py-2.5 shadow-soft"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}

