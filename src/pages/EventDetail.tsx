import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import PageLoader from "../component/PageLoader";
import { getEventById } from "../services/eventService";
import type { EventProps } from "../types";
import { formatDateLong } from "../utils/date";

const isExternal = (url?: string) => !!url && /^https?:\/\//i.test(url);
const isNA = (v?: string) => {
  if (!v) return true;
  const s = v.trim().toLowerCase();
  return s === "na" || s === "n/a" || s === "";
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!id) { setError("Invalid event id"); return; }
        const ev = await getEventById(id);
        setEvent(ev);
        setError(null);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load event";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <PageLoader variant="center" label="Loading event..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-red-600">{error}</p>
      </section>
    );
  }

  if (!event) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-gray-600 dark:text-gray-300">Event not found.</p>
      </section>
    );
  }

  const hasValidRegistration = !isNA(event.registrationUrl);
  const showFlyer = event.flyerUrl && event.flyerUrl !== event.imageUrl;

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Link to="/upcoming-events" className="text-sm text-brand-lime hover:underline">
          &larr; Back to Events
        </Link>

        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white">
          {event.name}
        </h1>

        {/* Pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {event.sport && <span className="glass-pill font-medium">{event.sport}</span>}
          {event.date && <span className="glass-pill font-medium">{formatDateLong(event.date)}</span>}
          {event.location && <span className="glass-pill font-medium">{event.location}</span>}
        </div>
      </motion.div>

      {/* Event Image */}
      {event.imageUrl && (
        <motion.div
          className="mt-4 aspect-[4/3] w-full relative rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src={event.imageUrl}
            alt={event.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>
      )}

      {/* Flyer (only if different from event image) */}
      {showFlyer && (
        <motion.div
          className="mt-4 w-full relative rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <img
            src={event.flyerUrl}
            alt={`${event.name} flyer`}
            className="w-full h-auto"
            loading="lazy"
          />
        </motion.div>
      )}

      {/* Description */}
      {event.description && (
        <motion.p
          className="mt-4 text-base text-gray-700 dark:text-gray-300 whitespace-pre-line"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {event.description}
        </motion.p>
      )}

      {/* Register Button */}
      {hasValidRegistration && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {isExternal(event.registrationUrl) ? (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button-primary py-3 px-8 text-base glass-glow-hover inline-block"
            >
              Register Now
            </a>
          ) : (
            <Link
              to={event.registrationUrl!}
              className="glass-button-primary py-3 px-8 text-base glass-glow-hover inline-block"
            >
              Register Now
            </Link>
          )}
        </motion.div>
      )}
    </section>
  );
}
