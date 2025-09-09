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
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full h-full flex flex-col glass-panel glass-hover-strong group"
    >
      {/* Fixed aspect ratio image container with glass overlay */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden rounded-t-2xl">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={imageUrl}
          alt={`${name} event image`}
          loading="lazy"
        />
        {/* Glass gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Subtle glass effect on image */}
        <div className="absolute inset-0 backdrop-blur-[0.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content area with glassmorphic styling */}
      <div className="flex flex-col h-full p-4 sm:p-5 relative">
        {/* Subtle background blur for content area */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/5 dark:bg-black/5 rounded-b-2xl" />
        
        {/* Content with proper z-index */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Title and description */}
          <header className="mb-3">
            <h3 className="font-display font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight drop-shadow-sm">
              {name}
            </h3>
            {description && (
              <p className="text-gray-700 dark:text-gray-200 text-sm line-clamp-2 leading-relaxed drop-shadow-sm">
                {description}
              </p>
            )}
          </header>

          {/* Glassmorphic tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {sport && (
              <span
                title={sport}
                className="glass-pill max-w-[120px] sm:max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis font-medium"
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
                    className="glass-button-primary py-2 px-4 text-sm glass-glow-hover"
                    aria-label={`Register for ${name}`}
                  >
                    Register Now
                  </a>
                ) : (
                  <Link
                    to={registrationUrl}
                    className="glass-button-primary py-2 px-4 text-sm glass-glow-hover"
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
