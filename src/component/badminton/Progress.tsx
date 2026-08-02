import { useBadmintonRegistration } from "../../hook/useBadmintonRegistration";

const stepsMetaData = [
  { id: 0, label: "Organisation" },
  { id: 1, label: "Entries" },
  { id: 2, label: "Review" },
  { id: 3, label: "Pay" },
];

export default function Progress() {
  const { state } = useBadmintonRegistration();
  const currentStep = state.step ?? 0;
  return (
    <nav aria-label="Registration Progress" className="w-full">
      <ol className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-2">
        {stepsMetaData.map((s, idx) => {
          const done = idx < currentStep;
          const now = idx === currentStep;
          return (
            <li key={s.id} className="flex items-center min-w-fit">
              <div
                className={[
                  "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full",
                  done
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : now
                    ? "bg-slate-100 text-slate-900 ring-2 ring-slate-900/60 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-100/60"
                    : "bg-white border border-slate-300 text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400",
                ].join(" ")}
                aria-current={now ? "step" : undefined}
              >
                {done ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <span className="text-xs sm:text-sm font-semibold">{idx + 1}</span>
                )}
              </div>
              <span
                className={[
                  "ml-2 sm:ml-3 text-xs sm:text-sm font-medium whitespace-nowrap",
                  done
                    ? "text-slate-700 dark:text-slate-200"
                    : now
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-slate-500 dark:text-slate-400",
                ].join(" ")}
              >
                {s.label}
              </span>
              {idx < stepsMetaData.length - 1 && (
                <span
                  className={[
                    "mx-3 sm:mx-4 h-[2px] w-10 sm:w-16 rounded",
                    idx < currentStep ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-200 dark:bg-slate-800",
                  ].join(" ")}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
