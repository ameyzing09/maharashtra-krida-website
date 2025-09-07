import React from "react";

const About: React.FC = () => {
  return (
    <section className="bg-brand-paper dark:bg-brand-charcoal text-brand-charcoal dark:text-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Heading */}
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">About Maharashtra Krida</h1>
          <p className="mt-3 text-gray-400 dark:text-gray-300 text-base sm:text-lg">
            Since 2001, we’ve built a vibrant, inclusive sporting ecosystem for corporate and IT communities across Maharashtra — enabling people to play, compete and celebrate together.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Our Mission</h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Promote a strong sports culture in workplaces by organizing fair, well-managed tournaments and creating pathways for lifelong participation.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate p-5 shadow-soft">
            <h2 className="text-lg font-semibold">What We Do</h2>
            <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 space-y-1">
              <li>End-to-end sports tournament management</li>
              <li>Facility consulting and operations support</li>
              <li>Community-first engagement and recognition</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Impact</h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Partnered with 200+ organizations across IT, banking, manufacturing and more. From local leagues to statewide events, our tournaments put people and fair play first.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Beyond Sports</h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              We support initiatives in health and safety, environmental responsibility and civic awareness through the power of sporting communities.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="/upcoming-events" className="inline-flex items-center justify-center rounded-full bg-brand-lime hover:bg-brand-limeDark text-white px-6 py-3 font-semibold shadow-soft">View Upcoming Events</a>
          <a href="/contact" className="inline-flex items-center justify-center rounded-full border border-brand-lime/60 text-brand-charcoal dark:text-white hover:bg-brand-lime/10 px-6 py-3 font-semibold">Contact Us</a>
        </div>
      </div>
    </section>
  );
};

export default About;
