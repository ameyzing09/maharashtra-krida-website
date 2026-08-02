import useHomepageContent from "../hook/useHomepage";
import { useEffect, useRef, useState } from "react";
import { listNews, NewsItem } from "../services/newsService";
import PageLoader from "./PageLoader";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MotionSection } from "./common/motion";

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

  const hasContent = content && content.length > 0;
  const hasNews = news && news.length > 0;
  if (!hasContent && !hasNews) {
    return null;
  }

  return (
    <MotionSection className="relative overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-orange-600/15 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
      {content && content.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-white"><span aria-hidden className="mr-3 inline-block h-6 w-1.5 -mb-0.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600" />Highlights</h2>
            <div className="hidden sm:flex gap-2">
              <button aria-label="Previous" onClick={scrollByRef(featuredRef, -1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-950">⟵</button>
              <button aria-label="Next" onClick={scrollByRef(featuredRef, 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-950">⟶</button>
            </div>
          </div>
          <div className="relative group">
            <div ref={featuredRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2">
              {content.map((item) => (
                <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} key={item.id} className="snap-center shrink-0 w-[85vw] max-w-[20rem] sm:max-w-none sm:w-96 md:w-[28rem] relative glass-panel overflow-hidden hover:ring-1 hover:ring-orange-400/50">
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
                </motion.article>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-950 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-950 to-transparent" />
          </div>
        </div>
      )}

      {news && news.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-white"><span aria-hidden className="mr-3 inline-block h-6 w-1.5 -mb-0.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600" />Latest News</h2>
            <div className="flex items-center gap-3">
              <Link to="/news" className="text-sm font-medium text-amber-400 underline underline-offset-4 decoration-amber-400/40 transition-colors hover:text-amber-300 hover:decoration-amber-300">See all</Link>
              <div className="hidden sm:flex gap-2">
                <button aria-label="Previous news" onClick={scrollByRef(newsRef, -1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-950">⟵</button>
                <button aria-label="Next news" onClick={scrollByRef(newsRef, 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-950">⟶</button>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2" ref={newsRef}>
              {news.map((n) => {
                const href = `/news/${n.id}`;
                return (
                  <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} whileHover={{ y: -4 }} key={n.id} className="relative snap-start shrink-0 w-[80vw] max-w-[18rem] sm:max-w-none sm:w-80 glass-panel overflow-hidden hover:ring-1 hover:ring-orange-400/50">
                    {n.imageUrl && (
                      <div className="aspect-[4/3] w-full relative">
                        <img src={n.imageUrl} alt={n.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">{n.title}</h3>
                      {n.summary && <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{n.summary}</p>}
                      <div className="mt-2">
                        <Link to={href} className="inline-flex items-center text-xs font-medium text-amber-400 underline underline-offset-4 decoration-amber-400/40 transition-colors hover:text-amber-300 hover:decoration-amber-300">Read more</Link>
                      </div>
                    </div>
                    <Link to={href} aria-label={n.title} className="absolute inset-0" />
                  </motion.article>
                );
              })}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-950 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-950 to-transparent" />
          </div>
        </div>
      )}
      </div>
    </MotionSection>
  );
}
