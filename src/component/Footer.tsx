import React from "react";
import { Link } from "react-router-dom";
import { ORGANISATION } from "../constants/organisation";

const linkClass =
  "text-sm text-gray-700 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200";

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 glass-panel-strong border-t border-white/20 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-lime-500 glass-glow" aria-hidden="true" />
              <span className="font-display text-lg font-bold text-gray-900 dark:text-white drop-shadow-sm">Maharashtra Krida</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 max-w-sm drop-shadow-sm">
              Energetic, community-first sports events across Maharashtra. Play, compete, and celebrate with us.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links" className="grid gap-2 content-start">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 drop-shadow-sm">Quick Links</h3>
            <Link to="/upcoming-events" className={linkClass}>Events</Link>
            <Link to="/badminton" className={linkClass}>Register</Link>
            <Link to="/registration/status" className={linkClass}>Registration Status</Link>
            <Link to="/about" className={linkClass}>About</Link>
            <Link to="/contact" className={linkClass}>Contact</Link>
          </nav>

          {/* Legal. Reachable from every page — Razorpay's merchant verification
              expects these four to be linked site-wide, not just findable. */}
          <nav aria-label="Policies" className="grid gap-2 content-start">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 drop-shadow-sm">Legal</h3>
            <Link to="/terms" className={linkClass}>Terms &amp; Conditions</Link>
            <Link to="/privacy" className={linkClass}>Privacy Policy</Link>
            <Link to="/refunds" className={linkClass}>Refund &amp; Cancellation</Link>
            <Link to="/shipping" className={linkClass}>Shipping &amp; Delivery</Link>
          </nav>

          {/* Contact. Single-sourced from constants/organisation so this can
              never drift from /contact or the policy pages again. */}
          <div className="grid gap-2 content-start">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 drop-shadow-sm">Contact</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {ORGANISATION.addressLines.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </p>
            <a href={`mailto:${ORGANISATION.email}`} className={linkClass}>{ORGANISATION.email}</a>
            <a href={ORGANISATION.phoneHref} className={linkClass}>{ORGANISATION.phone}</a>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/20 dark:border-white/10 pt-6">
          <p className="text-xs text-gray-600 dark:text-gray-400 drop-shadow-sm">© {new Date().getFullYear()} {ORGANISATION.legalName}. All rights reserved.</p>
          <div className="text-xs text-gray-600 dark:text-gray-400 drop-shadow-sm">Built with love in Maharashtra.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


