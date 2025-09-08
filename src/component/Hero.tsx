import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import GlassButton from "./ui/GlassButton";
import useEvents from "../hook/useEvents";
import { parseFlexibleDate, formatDateLong } from "../utils/date";

const Hero: React.FC = () => {
  const { eventsList } = useEvents();
  const nextEvent = useMemo(() => {
    const now = Date.now();
    const withTs = eventsList
      .map((e) => ({ e, ts: parseFlexibleDate(e.date)?.getTime() ?? null }))
      .filter((x): x is { e: typeof eventsList[number]; ts: number } => x.ts !== null);
    const upcoming = withTs
      .filter((x) => x.ts > now)
      .sort((a, b) => a.ts - b.ts);
    if (upcoming.length > 0) return upcoming[0].e;
    // fallback: latest event if none upcoming
    if (withTs.length > 0) return withTs.sort((a, b) => b.ts - a.ts)[0].e;
    return eventsList[0];
  }, [eventsList]);
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 60% at 20% 10%, rgba(132,204,22,0.15) 0%, rgba(132,204,22,0) 60%), " +
            "radial-gradient(50% 50% at 80% 30%, rgba(101,163,13,0.12) 0%, rgba(101,163,13,0) 55%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="font-display font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl text-brand-charcoal dark:text-white">
              Maharashtra Krida <br /> <span className="text-gray-400 text-3xl">Play, Compete, Celebrate...</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-400  dark:text-gray-300 max-w-prose">
              Join high-energy sports events across Maharashtra with pro-grade management, fair play, and recognition. Register now and be part of the community.
            </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {nextEvent && nextEvent.registrationUrl && !/^https?:\/\//i.test(nextEvent.registrationUrl) && !/^\s*(na|n\/a)\s*$/i.test(nextEvent.registrationUrl) && (
                  <GlassButton to={nextEvent.registrationUrl} size="lg">Register</GlassButton>
                )}
                <GlassButton to="/upcoming-events" size="lg" className="ring-white/30">View Events</GlassButton>
              </div>
          </div>

          <div className="relative hidden md:block">
            <div className="aspect-[4/3] w-full rounded-2xl shadow-lift overflow-hidden relative">
              {nextEvent?.imageUrl ? (
                <img src={nextEvent.imageUrl} alt={nextEvent.name} className="absolute inset-0 w-full h-full object-fit" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-charcoal to-brand-slate" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" aria-hidden />
              <div className="absolute bottom-4 left-4 right-4 px-3 py-2 rounded-md bg-black/40 text-white text-xs sm:text-sm tracking-wide backdrop-blur">
                {nextEvent ? (
                  <span>
                    Next up: <span className="font-semibold">{nextEvent.name}</span>
                    {nextEvent.location ? `, ${nextEvent.location}` : ""}
                    {nextEvent.date ? ` - ${formatDateLong(nextEvent.date)}` : ""}
                  </span>
                ) : (
                  <span>Next up: Stay tuned for upcoming events</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
