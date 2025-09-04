import React from "react";
import { Link } from "react-router-dom";

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 60% at 20% 10%, rgba(132,204,22,0.15) 0%, rgba(132,204,22,0) 60%), " +
            "radial-gradient(50% 50% at 80% 30%, rgba(101,163,13,0.12) 0%, rgba(101,163,13,0) 55%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="font-display font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl text-brand-charcoal dark:text-white">
              Maharashtra Krida: Play. Compete. Celebrate.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-prose">
              Join high-energy sports events across Maharashtra with pro-grade management, fair play, and recognition. Register now and be part of the community.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-brand-lime hover:bg-brand-limeDark text-white px-6 py-3 font-semibold shadow-lift"
              >
                Register
              </Link>
              <Link
                to="/upcoming-events"
                className="inline-flex items-center justify-center rounded-full border border-brand-lime/60 text-brand-charcoal dark:text-white hover:bg-brand-lime/10 px-6 py-3 font-semibold"
              >
                View Events
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-brand-charcoal to-brand-slate shadow-lift overflow-hidden">
              <div className="absolute inset-0 opacity-20" aria-hidden style={{
                background:
                  "radial-gradient(80% 80% at 30% 30%, rgba(132,204,22,0.5) 0%, transparent 60%)",
              }} />
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs tracking-wide backdrop-blur">
                Next up: Chess, Pune - Sep 2025
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

