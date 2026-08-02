import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { EventProps } from "../types";
import { formatDateLong } from "../utils/date";

type CardProps = EventProps & { registrationUrl?: string };

const isExternal = (url?: string) => !!url && /^https?:\/\//i.test(url);
const isNA = (v?: string) => {
  if (!v) return false;
  const s = v.trim().toLowerCase();
  return s === "na" || s === "n/a";
};

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
  const hasValidRegistration = registrationUrl && !isNA(registrationUrl);
  
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

          {/* Glassmorphic tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {sport && (
              <span
                title={sport}
                className="glass-pill-accent max-w-[120px] sm:max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {sport}
              </span>
            )}
            {date && (
              <span
                title={formatDateLong(date)}
                className="glass-pill max-w-[120px] sm:max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis font-medium"
              >
                {formatDateLong(date)}
              </span>
            )}
            {location && (
              <span
                title={location}
                className="glass-pill max-w-[120px] sm:max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis font-medium"
              >
                {location}
              </span>
            )}
          </div>

          {/* CTA row - pushed to bottom */}
          <div className="mt-auto">
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              {/* Always show View Flyer if available */}
              {flyerUrl && (
                <a
                  href={flyerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button-outline py-2 px-4 text-sm"
                  aria-label={`View flyer for ${name}`}
                >
                  View Flyer
                </a>
              )}
              
              {/* Register Now button - only show if there's a valid registration URL */}
              {hasValidRegistration && (
                isExternal(registrationUrl) ? (
                  <a
                    href={registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button-primary py-2 px-4 text-sm"
                    aria-label={`Register for ${name}`}
                  >
                    Register Now
                  </a>
                ) : (
                  <Link
                    to={registrationUrl}
                    className="glass-button-primary py-2 px-4 text-sm"
                    aria-label={`Register for ${name}`}
                  >
                    Register Now
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default EventCard;
