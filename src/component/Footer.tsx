import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 glass-panel-strong border-t border-white/20 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <Link to="/upcoming-events" className="text-sm text-gray-700 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">Events</Link>
            <Link to="/register" className="text-sm text-gray-700 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">Register</Link>
            <Link to="/about" className="text-sm text-gray-700 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">About</Link>
            <Link to="/contact" className="text-sm text-gray-700 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">Contact</Link>
          </nav>

          {/* Contact */}
          <div className="grid gap-2 content-start">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 drop-shadow-sm">Contact</h3>
            <a href="mailto:hello@maharashtrakrida.in" className="text-sm text-gray-700 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">hello@maharashtrakrida.in</a>
            <a href="tel:+919999999999" className="text-sm text-gray-700 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">+91 99999 99999</a>
            <div className="flex gap-3 mt-2" aria-label="Social links">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button-secondary h-9 w-9 p-0 hover:glass-glow-hover"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2A2.8 2.8 0 1 0 12 17.8 2.8 2.8 0 0 0 12 9.2zM18 6.3a1 1 0 1 1 0 2.1 1 1 0 0 1 0-2.1z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button-secondary h-9 w-9 p-0 hover:glass-glow-hover"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.26 4.26 0 0 0 1.87-2.35 8.52 8.52 0 0 1-2.7 1.03 4.24 4.24 0 0 0-7.22 3.87 12.04 12.04 0 0 1-8.74-4.43 4.24 4.24 0 0 0 1.31 5.66 4.2 4.2 0 0 1-1.92-.53v.05c0 2.05 1.46 3.77 3.4 4.17-.36.1-.75.16-1.14.16-.28 0-.55-.03-.81-.08.55 1.72 2.15 2.97 4.04 3a8.51 8.51 0 0 1-6.27 1.75 12 12 0 0 0 6.5 1.9c7.81 0 12.09-6.47 12.09-12.09l-.01-.55A8.64 8.64 0 0 0 22.46 6z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/20 dark:border-white/10 pt-6">
          <p className="text-xs text-gray-600 dark:text-gray-400 drop-shadow-sm">© {new Date().getFullYear()} Maharashtra Krida. All rights reserved.</p>
          <div className="text-xs text-gray-600 dark:text-gray-400 drop-shadow-sm">Built with love in Maharashtra.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


