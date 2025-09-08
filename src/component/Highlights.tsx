import { useEffect, useRef, useState } from "react";
import useHomepageContent from "../hook/useHomepage";
import { listNews, type NewsItem } from "../services/newsService";
import { TailSpin } from "react-loader-spinner";
import { Link } from "react-router-dom";

export default function Highlights() {
  const { content, loading, error } = useHomepageContent();
  const [news, setNews] = useState<NewsItem[]>([]);
  const featuredRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try { setNews(await listNews(8)); } catch { /* ignore */ }
    })();
  }, []);

  const scrollByRef = (ref: { current: HTMLDivElement | null }, dir: -1 | 1) => () => {
    const el = ref.current; if (!el) return; el.scrollBy({ left: Math.round(el.clientWidth * 0.8) * dir, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 flex justify-center">
        <TailSpin color="#84cc16" height={40} width={40} />
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
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-charcoal dark:text-white">Highlights</h2>
            <div className="hidden sm:flex gap-2">
              <button aria-label="Previous" onClick={scrollByRef(featuredRef, -1)} className="h-8 w-8 rounded-full border border-white/10 hover:bg-white/10 text-brand-charcoal dark:text-gray-100">
                <svg className="h-4 w-4 m-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>
              </button>
              <button aria-label="Next" onClick={scrollByRef(featuredRef, 1)} className="h-8 w-8 rounded-full border border-white/10 hover:bg-white/10 text-brand-charcoal dark:text-gray-100">
                <svg className="h-4 w-4 m-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
              </button>
            </div>
          </div>
          <div className="relative group">
            <div ref={featuredRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2">
              {content.map((item) => (
                <article key={item.id} className="snap-center shrink-0 w-80 sm:w-96 md:w-[28rem] relative rounded-2xl overflow-hidden border border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                  <div className="aspect-[16/9] w-full relative">
                    <img src={item.imageUrl} alt={item.alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{item.title}</h3>
                      {item.description && (
                        <p className="mt-1 text-xs sm:text-sm text-gray-200 line-clamp-2">{item.description}</p>
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
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white">Latest News</h2>
            <div className="flex items-center gap-3">
              <Link to="/news" className="text-sm text-brand-lime hover:underline">See all</Link>
              <div className="hidden sm:flex gap-2">
                <button aria-label="Previous news" onClick={scrollByRef(newsRef, -1)} className="h-8 w-8 rounded-full border border-white/10 hover:bg-white/10 text-brand-charcoal dark:text-gray-100">
                  <svg className="h-4 w-4 m-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>
                </button>
                <button aria-label="Next news" onClick={scrollByRef(newsRef, 1)} className="h-8 w-8 rounded-full border border-white/10 hover:bg-white/10 text-brand-charcoal dark:text-gray-100">
                  <svg className="h-4 w-4 m-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2" ref={newsRef}>
              {news.map((n) => {
                const href = `/news/${n.id}`;
                return (
                  <article key={n.id} className="relative snap-start shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden border border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
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

