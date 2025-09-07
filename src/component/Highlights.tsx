import { } from "react";
import useHomepageContent from "../hook/useHomepage";
import { TailSpin } from "react-loader-spinner";

export default function Highlights() {
  const { content, loading, error } = useHomepageContent();

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

  if (!content || content.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-charcoal dark:text-white mb-4">
        Highlights
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {content.map((item) => (
          <article key={item.id} className="relative rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate shadow-soft">
            <div className="aspect-[4/3] w-full relative">
              <img
                src={item.imageUrl}
                alt={item.alt}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
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
    </section>
  );
}
