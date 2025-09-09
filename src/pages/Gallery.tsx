import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageLoader from "../component/PageLoader";
import { GalleryItem, listGallery } from "../services/galleryService";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try { setLoading(true); setItems(await listGallery()); setError(null); }
      catch (e: any) { setError(e?.message || 'Failed to load gallery'); }
      finally { setLoading(false); }
    })();
  }, []);
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white mb-4">Gallery</h1>
      {loading ? (
        <PageLoader variant="center" label="Loading gallery..." />
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No gallery items yet.</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5"
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 1 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
        >
          {items.map((it) => (
            <motion.article
              key={it.id}
              className="rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate shadow-soft transition"
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.08)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="aspect-[4/3] w-full relative">
                <img src={it.imageUrl} alt={it.alt || it.title || 'Gallery'} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              </div>
              {(it.title || it.description) && (
                <div className="p-3">
                  {it.title && <h3 className="text-sm font-semibold text-brand-charcoal dark:text-gray-100">{it.title}</h3>}
                  {it.description && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{it.description}</p>}
                </div>
              )}
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  );
}

