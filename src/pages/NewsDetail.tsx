import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageLoader from "../component/PageLoader";
import { useParams, Link } from "react-router-dom";
import { getNewsItem, type NewsItem } from "../services/newsService";
import { getEvents } from "../services/eventService";
import type { EventProps } from "../types";

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventProps[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!id) { setError('Invalid news id'); return; }
        const [n, ev] = await Promise.all([
          getNewsItem(id),
          getEvents().catch(() => [] as EventProps[]),
        ]);
        setItem(n);
        setEvents(ev);
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load news');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const eventsById = useMemo(() => Object.fromEntries(events.map(e => [e.id, e])), [events]);

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <PageLoader variant="center" label="Loading news..." />
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
  if (!item) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-gray-600 dark:text-gray-300">News not found.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Link to="/news" className="text-sm text-brand-lime hover:underline">← Back to News</Link>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white">{item.title}</h1>
        {item.eventId && eventsById[item.eventId] && (
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Related event: <span className="font-medium">{eventsById[item.eventId].name}</span>
          </div>
        )}
      </motion.div>
      {item.imageUrl && (
        <motion.div className="mt-4 aspect-[4/3] w-full relative rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        </motion.div>
      )}
      {item.summary && (
        <motion.p className="mt-4 text-base text-gray-700 dark:text-gray-300 whitespace-pre-line" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {item.summary}
        </motion.p>
      )}
      {item.content && (
        <motion.div className="prose dark:prose-invert max-w-none mt-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <p className="whitespace-pre-line">{item.content}</p>
        </motion.div>
      )}
    </section>
  );
}
