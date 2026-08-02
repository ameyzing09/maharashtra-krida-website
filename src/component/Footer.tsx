import React from "react";
import { Link } from "react-router-dom";
import { ORGANISATION } from "../constants/organisation";

const linkClass =
  "text-sm text-slate-400 hover:text-amber-300 transition-colors duration-200";

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600" aria-hidden="true" />
              <span className="font-display text-lg font-bold text-white">Maharashtra Krida</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Energetic, community-first sports events across Maharashtra. Play, compete, and celebrate with us.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links" className="grid gap-2 content-start">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">Quick Links</h3>
            <Link to="/upcoming-events" className={linkClass}>Events</Link>
            <Link to="/badminton" className={linkClass}>Register</Link>
            <Link to="/registration/status" className={linkClass}>Registration Status</Link>
            <Link to="/about" className={linkClass}>About</Link>
            <Link to="/contact" className={linkClass}>Contact</Link>
          </nav>

          {/* Legal. Reachable from every page — Razorpay's merchant verification
              expects these four to be linked site-wide, not just findable. */}
          <nav aria-label="Policies" className="grid gap-2 content-start">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">Legal</h3>
            <Link to="/terms" className={linkClass}>Terms &amp; Conditions</Link>
            <Link to="/privacy" className={linkClass}>Privacy Policy</Link>
            <Link to="/refunds" className={linkClass}>Refund &amp; Cancellation</Link>
            <Link to="/shipping" className={linkClass}>Shipping &amp; Delivery</Link>
          </nav>

          {/* Contact. Single-sourced from constants/organisation so this can
              never drift from /contact or the policy pages again. */}
          <div className="grid gap-2 content-start">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">Contact</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {ORGANISATION.addressLines.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </p>
            <a href={`mailto:${ORGANISATION.email}`} className={linkClass}>{ORGANISATION.email}</a>
            <a href={ORGANISATION.phoneHref} className={linkClass}>{ORGANISATION.phone}</a>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} {ORGANISATION.legalName}. All rights reserved.</p>
          <div className="text-xs text-slate-500">Built with love in Maharashtra.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


