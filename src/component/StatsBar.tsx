import { useMemo } from "react";
import useEvents from "../hook/useEvents";

export default function StatsBar() {
  const { eventsList } = useEvents();
  const stats = useMemo(() => [
    { label: "Companies", value: "2000+" },
    { label: "Years Exp.", value: "10+" },
    { label: "Hours of Sport", value: "800+" },
    { label: "Participants", value: "150M+" },
  ], []);

  const eventsCount = eventsList.length;

  return (
    <section className="mx-auto max-w-6xl px-4 -mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, idx) => (
          <div key={idx} className="rounded-2xl border border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4">
            <div className="text-xl font-extrabold text-brand-lime">{s.value}</div>
            <div className="text-xs text-gray-200">{s.label}</div>
          </div>
        ))}
      </div>
      {eventsCount > 0 && (
        <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">Currently featuring {eventsCount} tournaments and events.</p>
      )}
    </section>
  );
}

