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
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load news');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const eventsById = useMemo(() => Object.fromEntries(events.map(e => [e.id, e])), [events]);

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <PageLoader variant="center" label="Loading news..." />
      </section>
    );
  }
  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="text-red-600">{error}</p>
      </section>
    );
  }
  if (!item) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="text-slate-600 dark:text-slate-400">News not found.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Link to="/news" className="text-sm text-slate-900 dark:text-slate-100 font-medium underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 dark:decoration-slate-600 dark:hover:decoration-slate-400">← Back to News</Link>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{item.title}</h1>
        {item.eventId && eventsById[item.eventId] && (
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Related event: <span className="font-medium">{eventsById[item.eventId].name}</span>
          </div>
        )}
      </motion.div>
      {item.imageUrl && (
        <motion.div className="mt-4 aspect-[4/3] w-full relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        </motion.div>
      )}
      {item.summary && (
        <motion.p className="mt-4 text-base text-slate-600 dark:text-slate-400 whitespace-pre-line" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
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
