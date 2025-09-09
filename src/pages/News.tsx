import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { NewsItem, listNews } from "../services/newsService";
import { Link } from "react-router-dom";
import { getEvents } from "../services/eventService";
import type { EventProps } from "../types";

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventProps[]>([]);
  useEffect(() => {
    (async () => {
      try { setLoading(true); setItems(await listNews(50)); setError(null); }
      catch (e: any) { setError(e?.message || 'Failed to load news'); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try { setEvents(await getEvents()); } catch { /* ignore */ }
    })();
  }, []);

  const eventsById = useMemo(() => Object.fromEntries(events.map(e => [e.id, e])), [events]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white mb-4">News</h1>
      {loading ? (
        <div className="py-10 text-gray-600 dark:text-gray-300">Loading…</div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No news yet.</p>
      ) : (
        <motion.div
          className="divide-y divide-black/5 dark:divide-white/10"
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 1 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
        >
          {items.map((n) => {
            const href = `/news/${n.id}`;
            return (
              <motion.article key={n.id} className="relative py-4 flex gap-4" variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                {n.imageUrl && (
                  <img src={n.imageUrl} alt={n.title} className="h-24 w-32 object-cover rounded-md flex-shrink-0" loading="lazy" />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-brand-charcoal dark:text-gray-100 line-clamp-2 break-words">{n.title}</h3>
                  {n.summary && <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 line-clamp-2 break-words">{n.summary}</p>}
                  <div className="mt-2 flex items-center gap-3">
                    <Link to={href} className="text-sm text-brand-lime hover:underline">Read more</Link>
                    {n.eventId && eventsById[n.eventId] && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-xs text-gray-700 dark:text-gray-300">
                        Event: {eventsById[n.eventId].name}
                      </span>
                    )}
                  </div>
                </div>
                <Link to={href} aria-label={n.title} className="absolute inset-0" />
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}
