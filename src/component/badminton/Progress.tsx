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
                    ? "bg-brand-lime text-white"
                    : now
                    ? "bg-brand-lime/15 text-brand-lime ring-2 ring-brand-lime/60"
                    : "bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300",
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
                    ? "text-gray-700 dark:text-gray-200"
                    : now
                    ? "text-brand-lime"
                    : "text-gray-500 dark:text-gray-400",
                ].join(" ")}
              >
                {s.label}
              </span>
              {idx < stepsMetaData.length - 1 && (
                <span
                  className={[
                    "mx-3 sm:mx-4 h-[2px] w-10 sm:w-16 rounded",
                    idx < currentStep ? "bg-brand-lime" : "bg-black/10 dark:bg-white/10",
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
