import useHomepageContent from "../hook/useHomepage";
import { useEffect, useRef, useState } from "react";
import { listNews, NewsItem } from "../services/newsService";
import PageLoader from "./PageLoader";
import { Link } from "react-router-dom";

export default function Highlights() {
  const { content, loading, error } = useHomepageContent();
  const [news, setNews] = useState<NewsItem[]>([]);
  const featuredRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  useEffect(() => { (async () => { try { setNews(await listNews(8)); } catch { /* ignore */ } })(); }, []);

  const scrollByRef = (ref: { current: HTMLDivElement | null }, dir: -1 | 1) => () => {
    const el = ref.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.8) * dir;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4">
        <PageLoader variant="center" label="Loading highlights..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 text-red-600">{error}</div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {content && content.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-sm">Highlights</h2>
            <div className="hidden sm:flex gap-2">
              <button aria-label="Previous" onClick={scrollByRef(featuredRef, -1)} className="glass-button-secondary h-8 w-8 p-0 text-gray-800 dark:text-white">⟵</button>
              <button aria-label="Next" onClick={scrollByRef(featuredRef, 1)} className="glass-button-secondary h-8 w-8 p-0 text-gray-800 dark:text-white">⟶</button>
            </div>
          </div>
          <div className="relative group">
            <div ref={featuredRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2">
              {content.map((item) => (
                <article key={item.id} className="snap-center shrink-0 w-80 sm:w-96 md:w-[28rem] relative glass-panel">
                  <div className="aspect-[16/9] w-full relative">
                    <img src={item.imageUrl} alt={item.alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-semibold text-base sm:text-lg line-clamp-2 drop-shadow-sm">{item.title}</h3>
                      {item.description && (
                        <p className="mt-1 text-xs sm:text-sm text-gray-200 line-clamp-2 drop-shadow-sm">{item.description}</p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent dark:from-brand-charcoal" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent dark:from-brand-charcoal" />
          </div>
        </div>
      )}

      {news && news.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">Latest News</h2>
            <div className="flex items-center gap-3">
              <Link to="/news" className="text-sm text-lime-600 dark:text-lime-400 hover:underline">See all</Link>
              <div className="hidden sm:flex gap-2">
                <button aria-label="Previous news" onClick={scrollByRef(newsRef, -1)} className="glass-button-secondary h-8 w-8 p-0 text-gray-800 dark:text-white">⟵</button>
                <button aria-label="Next news" onClick={scrollByRef(newsRef, 1)} className="glass-button-secondary h-8 w-8 p-0 text-gray-800 dark:text-white">⟶</button>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2" ref={newsRef}>
              {news.map((n) => {
                const href = `/news/${n.id}`;
                return (
                  <article key={n.id} className="relative snap-start shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate shadow-soft">
                    {n.imageUrl && (
                      <div className="aspect-[4/3] w-full relative">
                        <img src={n.imageUrl} alt={n.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-brand-charcoal dark:text-gray-100 line-clamp-2">{n.title}</h3>
                      {n.summary && <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{n.summary}</p>}
                      <div className="mt-2">
                        <Link to={href} className="inline-flex items-center text-xs text-brand-lime hover:underline">Read more</Link>
                      </div>
                    </div>
                    <Link to={href} aria-label={n.title} className="absolute inset-0" />
                  </article>
                );
              })}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent dark:from-brand-charcoal" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent dark:from-brand-charcoal" />
          </div>
        </div>
      )}
    </section>
  );
}
