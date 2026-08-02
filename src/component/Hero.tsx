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
    <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Hero content card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-panel-strong p-6 sm:p-8"
          >
            <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl text-slate-900 dark:text-slate-100">
              Maharashtra Krida <br />
              <span className="text-slate-500 dark:text-slate-400 text-3xl">Play, Compete, Celebrate...</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-prose">
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
                  className="glass-button-outline px-6 py-3 text-base"
                >
                  View Events
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Event showcase in glass panel */}
          <motion.div 
            className="relative hidden md:block" 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="glass-panel-strong aspect-[4/3] w-full overflow-hidden relative rounded-2xl group">
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
                    <span className="font-mono text-xs uppercase tracking-wide font-semibold text-slate-200">Next up:</span> {nextEvent.name}
                    {nextEvent.location && <span className="block text-slate-300">{nextEvent.location}</span>}
                    {nextEvent.date && <span className="block text-slate-300">{formatDateLong(nextEvent.date)}</span>}
                  </div>
                ) : (
                  <div className="text-white text-xs sm:text-sm tracking-wide">
                    <span className="font-mono text-xs uppercase tracking-wide font-semibold text-slate-200">Next up:</span> Stay tuned for upcoming events
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
