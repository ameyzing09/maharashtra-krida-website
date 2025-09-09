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
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 glass-bg-gradient dark:glass-bg-gradient-dark" aria-hidden />
      
      {/* Additional floating elements for depth */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20 relative z-10">
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Hero content in glass panel */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
            className="glass-panel-strong p-6 sm:p-8"
          >
            <h1 className="font-display font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl text-gray-900 dark:text-white drop-shadow-sm">
              Maharashtra Krida <br /> 
              <span className="text-lime-600 dark:text-lime-400 text-3xl">Play, Compete, Celebrate...</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-700 dark:text-gray-200 max-w-prose drop-shadow-sm">
              Join high-energy sports events across Maharashtra with pro-grade management, fair play, and recognition. Register now and be part of the community.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {nextEvent && nextEvent.registrationUrl && !/^https?:\/\//i.test(nextEvent.registrationUrl) && !/^\s*(na|n\/a)\s*$/i.test(nextEvent.registrationUrl) && (
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={nextEvent.registrationUrl}
                    className="glass-button-primary px-6 py-3 text-base glass-glow-hover"
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
            <div className="glass-panel-strong aspect-[4/3] w-full overflow-hidden relative group">
              {nextEvent?.imageUrl ? (
                <img 
                  src={nextEvent.imageUrl} 
                  alt={nextEvent.name} 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" aria-hidden />
              
              {/* Glass overlay for event info */}
              <div className="absolute bottom-4 left-4 right-4 glass-panel-subtle p-3 backdrop-blur-md">
                {nextEvent ? (
                  <div className="text-white text-xs sm:text-sm tracking-wide">
                    <span className="font-semibold text-lime-300">Next up:</span> {nextEvent.name}
                    {nextEvent.location && <span className="block text-gray-300">{nextEvent.location}</span>}
                    {nextEvent.date && <span className="block text-gray-300">{formatDateLong(nextEvent.date)}</span>}
                  </div>
                ) : (
                  <div className="text-white text-xs sm:text-sm tracking-wide">
                    <span className="font-semibold text-lime-300">Next up:</span> Stay tuned for upcoming events
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
