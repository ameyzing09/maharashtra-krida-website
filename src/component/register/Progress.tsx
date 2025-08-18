import { useRegistrationContext } from "../../hook/useRegistration";

const labels = ["Details", "Review", "Pay", "Done"];

export default function Progress() {
  const { state } = useRegistrationContext();
  return (
    <ol className="flex items-center w-full mb-6">
      {labels.map((l, i) => {
        const active = i <= state.step;
        return (
          <li key={l} className="flex-1 flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white
              ${active ? "bg-lime-500" : "bg-gray-300"}`}>
              {i + 1}
            </div>
            <div className={`ml-2 text-sm ${active ? "text-gray-900" : "text-gray-400"}`}>{l}</div>
            {i < labels.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${i < state.step ? "bg-lime-400" : "bg-gray-200"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
