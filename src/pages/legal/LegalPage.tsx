import React from "react";
import { Link } from "react-router-dom";
import { ADDRESS_INLINE, ORGANISATION } from "../../constants/organisation";

/**
 * Shared shell for the four policy pages Razorpay's merchant verification looks
 * for. Keeps them visually consistent with /about and /contact, and puts the
 * "last updated" line and the contact block in one place so they can never
 * disagree between pages.
 */

type Props = {
  title: string;
  /** One-line summary shown under the heading. */
  intro: string;
  children: React.ReactNode;
};

export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{heading}</h2>
      <div className="mt-2 space-y-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function LegalPage({ title, intro, children }: Props) {
  return (
    <section className="bg-brand-paper dark:bg-brand-charcoal text-brand-charcoal dark:text-gray-200">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-brand-charcoal dark:text-white">
          {title}
        </h1>
        <p className="mt-3 text-gray-700 dark:text-gray-300 text-base">{intro}</p>
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          Last updated: {ORGANISATION.policiesLastUpdated}
        </p>

        <div className="mt-8 glass-panel p-5 sm:p-6">{children}</div>

        {/* Every policy page ends with a working way to reach a human — Razorpay
            checks that contact details are present and consistent site-wide. */}
        <div className="mt-6 glass-panel p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact us</h2>
          <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium text-gray-900 dark:text-white">{ORGANISATION.legalName}</p>
            <p>{ADDRESS_INLINE}</p>
            <p>
              Attn: {ORGANISATION.contactName} &middot;{" "}
              <a
                href={ORGANISATION.phoneHref}
                className="text-lime-600 dark:text-lime-400 hover:underline"
              >
                {ORGANISATION.phone}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${ORGANISATION.email}`}
                className="text-lime-600 dark:text-lime-400 hover:underline"
              >
                {ORGANISATION.email}
              </a>
            </p>
          </div>
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            We usually respond within 1–2 business days. See also our{" "}
            <Link to="/contact" className="text-lime-600 dark:text-lime-400 hover:underline">
              contact page
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
