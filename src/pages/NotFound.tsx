import React from "react";

const NotFound: React.FC = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-2xl border border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-8 text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-charcoal dark:text-white">404 — Page not found</h1>
        <p className="mt-2 text-gray-700 dark:text-gray-300">The page you’re looking for doesn’t exist or has been moved.</p>
        <a href="/" className="mt-4 inline-block rounded-full bg-brand-lime hover:bg-brand-limeDark text-white px-6 py-3 font-semibold">Go Home</a>
      </div>
    </section>
  );
};

export default NotFound;
