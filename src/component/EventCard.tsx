import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { EventProps } from "../types";
import { formatDateLong } from "../utils/date";
import { hasValidRegistration, isExternalUrl } from "../utils/registrationUrl";

type CardProps = EventProps & { registrationUrl?: string };

const EventCard: React.FC<CardProps> = ({
  name,
  sport,
  date,
  location,
  imageUrl,
  flyerUrl,
  description,
  registrationUrl,
}) => {

  return (
    <motion.article
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="w-full h-full flex flex-col glass-panel glass-hover-strong relative overflow-hidden hover:border-orange-300 dark:hover:border-orange-400/40 group"
    >
      {/* Fixed aspect ratio image container with glass overlay */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden rounded-t-2xl">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={imageUrl}
          alt={`${name} event image`}
          loading="lazy"
        />
        {/* Gradient overlay for image legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Content area */}
      <div className="flex flex-col h-full p-4 sm:p-5 relative">
        <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-orange-500/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 flex flex-col h-full">
          {/* Title and description */}
          <header className="mb-3">
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 leading-tight">
              {name}
            </h3>
            {description && (
              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </header>

          {/* Glassmorphic tags.
              `max-w-full`, not a fixed cap: a 120px cap truncated ordinary
              values — "29th August 2026" needs ~139px and "Nahata Sports
              Complex" ~175px, both of which fit the card and simply wrap.
              Truncation is the fallback for a pathologically long value, not
              the normal case.
              The `truncate` sits on an inner span because .glass-pill is
              inline-flex, and text-overflow does not apply to flex
              containers — so `text-ellipsis` on the pill itself was a no-op
              and the text was chopped with no ellipsis at all. A flex item is
              blockified, so it works there; min-w-0 lets it shrink far enough
              to actually ellipsize. */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {sport && (
              <span title={sport} className="glass-pill-accent max-w-full">
                <span className="min-w-0 truncate">{sport}</span>
              </span>
            )}
            {date && (
              <span title={formatDateLong(date)} className="glass-pill max-w-full font-medium">
                <span className="min-w-0 truncate">{formatDateLong(date)}</span>
              </span>
            )}
            {location && (
              <span title={location} className="glass-pill max-w-full font-medium">
                <span className="min-w-0 truncate">{location}</span>
              </span>
            )}
          </div>

          {/* CTA row - pushed to bottom.
              flex-wrap rather than `flex-col sm:flex-row`: this card's width
              comes from the grid in Event.tsx (1 / md:2 / lg:3 columns), not
              from the viewport, so it is *widest* at 640-767px and narrowest
              from md up. Any sm:/md: guess here is wrong at some column count
              — at md the two controls came to ~322px against ~318px of card,
              and both labels wrapped mid-phrase over four pixels. Let the row
              wrap and the labels stay whole. */}
          <div className="mt-auto">
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {/* Always show View Flyer if available */}
              {flyerUrl && (
                <a
                  href={flyerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button-outline whitespace-nowrap py-2 px-4 text-sm"
                  aria-label={`View flyer for ${name}`}
                >
                  View Flyer
                </a>
              )}
              
              {/* Register Now button if there's a valid registration URL, otherwise let people know it's coming */}
              {hasValidRegistration(registrationUrl) ? (
                isExternalUrl(registrationUrl) ? (
                  <a
                    href={registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button-primary whitespace-nowrap py-2 px-4 text-sm"
                    aria-label={`Register for ${name}`}
                  >
                    Register Now
                  </a>
                ) : (
                  <Link
                    to={registrationUrl as string}
                    className="glass-button-primary whitespace-nowrap py-2 px-4 text-sm"
                    aria-label={`Register for ${name}`}
                  >
                    Register Now
                  </Link>
                )
              ) : (
                <span className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                  Registration opening soon
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default EventCard;
