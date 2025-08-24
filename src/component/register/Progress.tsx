import { useRegistrationContext } from "../../hook/useRegistration";

const stepsMetaData = [
  { id: 0, label: "Details" },
  { id: 1, label: "Review" },
  { id: 2, label: "Pay" },
  { id: 3, label: "Done" }
]

export default function Progress() {
  const { state } = useRegistrationContext();
  const currentStep = state.step ?? 0
  return (
    // <ol className="flex items-center w-full mb-6">
    //   {labels.map((l, i) => {
    //     const active = i <= state.step;
    //     return (
    //       <li key={l} className="flex-1 flex items-center">
    //         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white
    //           ${active ? "bg-lime-500" : "bg-gray-300"}`}>
    //           {i + 1}
    //         </div>
    //         <div className={`ml-2 text-sm ${active ? "text-gray-900" : "text-gray-400"}`}>{l}</div>
    //         {i < labels.length - 1 && (
    //           <div className={`flex-1 h-1 mx-2 ${i < state.step ? "bg-lime-400" : "bg-gray-200"}`} />
    //         )}
    //       </li>
    //     );
    //   })}
    // </ol>
    <nav aria-label="Registration Progress" className="w-full">
      <ol className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-2">
        {
          stepsMetaData.map((s, idx) => {
            const done = idx < currentStep;
            const now = idx === currentStep;

            return (
              <li key={s.id} className="flex items-center min-w-fit">
                <div className={[
                  "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full",
                  done ? "bg-lime-500 text-white" : now ? "bg-lime-100 text-lime-700 ring-2 ring-lime-400" : "bg-gray-200 text-gray-600"
                ].join(" ")}
                  aria-current={now ? "step" : undefined}
                >
                  {done ? (
                    // check icon
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold">{idx + 1}</span>
                  )}
                </div>
                <span className={[
                  "ml-2 sm:ml-3 text-xs sm:text-sm font-medium whitespace-nowrap",
                  done ? "text-gray-700" : now ? "text-lime-700" : "text-gray-500",
                ].join(" ")}
                >
                  {s.label}
                </span>
                {
                  idx < stepsMetaData.length - 1 && (
                    <span className={[
                      "mx-3 sm:mx-4 h-[2px] w-10 sm:w-16 rounded",
                      idx < currentStep ? "bg-lime-400" : "bg-gray-200",
                    ].join(" ")}
                      aria-hidden="true"
                    />
                  )
                }
              </li>
            )
          })
        }
      </ol>
    </nav>
  );
}
