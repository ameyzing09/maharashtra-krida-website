import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
    <section className="relative overflow-hidden bg-slate-950">
      {/* Decorative accent layer — static, clipped, no copy */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-orange-600/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="hidden md:block absolute -inset-y-12 right-[14%] w-px rotate-12 bg-gradient-to-b from-transparent via-orange-500/30 to-transparent" />
        <div className="hidden md:block absolute -inset-y-12 right-[19%] w-px rotate-12 bg-gradient-to-b from-transparent via-amber-400/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Hero content — borderless on the dark band */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-display font-black tracking-tight text-5xl sm:text-6xl lg:text-7xl text-white">
              <span className="uppercase">Maharashtra Krida</span> <br />
              <span className="block mt-2 accent-gradient-text-bright text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">Play, Compete, Celebrate...</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-prose">
              Join high-energy sports events across Maharashtra with pro-grade management, fair play, and recognition. Register now and be part of the community.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {nextEvent && nextEvent.registrationUrl && !/^https?:\/\//i.test(nextEvent.registrationUrl) && !/^\s*(na|n\/a)\s*$/i.test(nextEvent.registrationUrl) && (
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={nextEvent.registrationUrl}
                    className="glass-button-primary px-6 py-3 text-base"
                  >
                    Register
                  </Link>
                </motion.div>
              )}
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/upcoming-events"
                  className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3 text-base font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  View Events
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Event showcase in a gradient frame */}
          <motion.div
            className="relative hidden md:block rounded-2xl bg-gradient-to-br from-amber-400/70 via-orange-500/40 to-transparent p-px shadow-2xl shadow-orange-950/50"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="aspect-[4/3] w-full overflow-hidden relative rounded-[calc(1rem-1px)] bg-slate-900 group">
              {nextEvent?.imageUrl ? (
                <img 
                  src={nextEvent.imageUrl} 
                  alt={nextEvent.name} 
                  className="absolute inset-0 w-full h-full object-fit" 
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" aria-hidden />
              
              {/* Event info overlay */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-900/80 backdrop-blur px-3 py-2">
                {nextEvent ? (
                  <div className="text-white text-xs sm:text-sm tracking-wide">
                    <span className="font-mono text-xs uppercase tracking-wide font-semibold text-amber-300">Next up:</span> {nextEvent.name}
                    {nextEvent.location && <span className="block text-slate-300">{nextEvent.location}</span>}
                    {nextEvent.date && <span className="block text-slate-300">{formatDateLong(nextEvent.date)}</span>}
                  </div>
                ) : (
                  <div className="text-white text-xs sm:text-sm tracking-wide">
                    <span className="font-mono text-xs uppercase tracking-wide font-semibold text-amber-300">Next up:</span> Stay tuned for upcoming events
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
