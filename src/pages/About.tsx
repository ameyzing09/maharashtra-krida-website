import React from "react";
import { MotionSection, MotionGrid, MotionItem } from "../component/common/motion";

type AboutProps = {
  /* When rendered inside another page (e.g. Home), demote the page heading to
     an h2 so the document keeps a single h1. */
  embedded?: boolean;
};

const About: React.FC<AboutProps> = ({ embedded = false }) => {
  const Heading = embedded ? "h2" : "h1";
  return (
    <MotionSection className="bg-gradient-to-b from-amber-50/80 via-orange-50/40 to-transparent dark:from-slate-900/50 dark:via-slate-900/20 dark:to-transparent">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Heading */}
        <div className="max-w-3xl">
          <Heading className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100"><span aria-hidden className="mr-3 inline-block h-7 w-1.5 -mb-0.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600" />About Maharashtra Krida</Heading>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Since 2001, we’ve built a vibrant, inclusive sporting ecosystem for corporate and IT communities across Maharashtra — enabling people to play, compete and celebrate together.
          </p>
        </div>

        {/* Bento cards */}
        <MotionGrid className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-6 md:auto-rows-fr">
          <MotionItem className="glass-panel p-5 sm:p-6 md:col-span-4 group relative overflow-hidden hover:border-orange-200 dark:hover:border-orange-400/30 hover:shadow-md">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Our Mission</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Promote a strong sports culture in workplaces by organizing fair, well-managed tournaments and creating pathways for lifelong participation.
            </p>
          </MotionItem>

          <MotionItem className="glass-panel p-5 sm:p-6 md:col-span-2 group relative overflow-hidden hover:border-orange-200 dark:hover:border-orange-400/30 hover:shadow-md">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">What We Do</h3>
            <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400 list-disc pl-5 space-y-1">
              <li>End-to-end sports tournament management</li>
              <li>Facility consulting and operations support</li>
              <li>Community-first engagement and recognition</li>
            </ul>
          </MotionItem>

          <MotionItem className="glass-panel p-5 sm:p-6 md:col-span-2 group relative overflow-hidden hover:border-orange-200 dark:hover:border-orange-400/30 hover:shadow-md">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Impact</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Partnered with 200+ organizations across IT, banking, manufacturing and more. From local leagues to statewide events, our tournaments put people and fair play first.
            </p>
          </MotionItem>

          <MotionItem className="glass-panel p-5 sm:p-6 md:col-span-4 group relative overflow-hidden hover:border-orange-200 dark:hover:border-orange-400/30 hover:shadow-md">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Beyond Sports</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              We support initiatives in health and safety, environmental responsibility and civic awareness through the power of sporting communities.
            </p>
          </MotionItem>
        </MotionGrid>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="/upcoming-events" className="glass-button-primary px-6 py-3">View Upcoming Events</a>
          <a href="/contact" className="glass-button-outline px-6 py-3">Contact Us</a>
        </div>
      </div>
    </MotionSection>
  );
};

export default About;
