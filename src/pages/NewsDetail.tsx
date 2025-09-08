import { useEffect, useMemo, useState } from "react";
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
        <p className="text-gray-600 dark:text-gray-300">Loading…</p>
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
      <Link to="/news" className="text-sm text-brand-lime hover:underline">← Back to News</Link>
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-5">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white">{item.title}</h1>
        {item.eventId && eventsById[item.eventId] && (
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Related event: <span className="font-medium">{eventsById[item.eventId].name}</span>
          </div>
        )}
      </div>
      {item.imageUrl && (
        <div className="mt-4 aspect-[4/3] w-full relative rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate">
          <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      {item.summary && (
        <p className="mt-4 text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">{item.summary}</p>
      )}
      {item.content && (
        <div className="prose dark:prose-invert max-w-none mt-4 rounded-2xl border border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-5">
          <p className="whitespace-pre-line">{item.content}</p>
        </div>
      )}
    </section>
  );
}
