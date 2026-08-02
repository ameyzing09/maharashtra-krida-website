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
      catch (e) { setError(e instanceof Error ? e.message : 'Failed to load news'); }
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
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">News</h1>
      {loading ? (
        <div className="py-10 text-slate-600 dark:text-slate-400">Loading…</div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">No news yet.</p>
      ) : (
        <motion.div className="divide-y divide-slate-200 dark:divide-slate-800">
          {items.map((n) => {
            const href = `/news/${n.id}`;
            return (
              <motion.article
                key={n.id}
                className="relative py-4 flex gap-4"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35 }}
              >
                {n.imageUrl && (
                  <img src={n.imageUrl} alt={n.title} className="h-24 w-32 object-cover rounded-md flex-shrink-0" loading="lazy" />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 break-words">{n.title}</h3>
                  {n.summary && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 break-words">{n.summary}</p>}
                  <div className="mt-2 flex items-center gap-3">
                    <Link to={href} className="text-sm text-slate-900 dark:text-slate-100 font-medium underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 dark:decoration-slate-600 dark:hover:decoration-slate-400">Read more</Link>
                    {n.eventId && eventsById[n.eventId] && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-slate-200 bg-slate-100 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
