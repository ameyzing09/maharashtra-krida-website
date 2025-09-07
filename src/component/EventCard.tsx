import React from "react";
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
  return (
    <article className="w-full rounded-2xl overflow-hidden bg-white dark:bg-brand-slate shadow-soft transition hover:shadow-lift">
      <img
        className="w-full h-44 sm:h-52 md:h-56 object-fit"
        src={imageUrl}
        alt={name}
        loading="lazy"
      />

      <div className="p-4 sm:p-6 flex flex-col gap-4">
        {/* title + desc */}
        <header>
          <h3 className="font-display font-bold text-lg sm:text-xl text-brand-charcoal dark:text-white mb-1 line-clamp-2">
            {name}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base line-clamp-3">
            {description}
          </p>
        </header>

        {/* chips */}
        <div className="flex flex-wrap gap-2">
          {sport && (
            <span className="inline-flex items-center rounded-full bg-black/5 dark:bg-white/10 text-brand-charcoal dark:text-gray-200 px-3 py-1 text-xs sm:text-sm">
              {sport}
            </span>
          )}
          {date && (
            <span className="inline-flex items-center rounded-full bg-black/5 dark:bg-white/10 text-brand-charcoal dark:text-gray-200 px-3 py-1 text-xs sm:text-sm">
              {formatDateLong(date)}
            </span>
          )}
          {location && (
            <span className="inline-flex items-center rounded-full bg-black/5 dark:bg-white/10 text-brand-charcoal dark:text-gray-200 px-3 py-1 text-xs sm:text-sm">
              {location}
            </span>
          )}
        </div>

        {/* actions */}
        <div className="mt-1 flex flex-col sm:flex-row gap-2">
          {flyerUrl && (
            <a
              href={flyerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center rounded-full border border-brand-lime/60 text-brand-charcoal dark:text-white hover:bg-brand-lime/10 font-semibold py-2.5 px-5"
            >
              View Flyer
            </a>
          )}

          {registrationUrl
            ? isNA(registrationUrl)
              ? null
              : isExternal(registrationUrl)
                ? (
                  <a
                    href={registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center rounded-full border border-black/10 bg-brand-lime hover:bg-brand-limeDark text-brand-charcoal font-semibold py-2.5 px-5 shadow-soft"
                  >
                    Register Now
                  </a>
                )
                : (
                  <Link
                    to={registrationUrl}
                    className="w-full sm:w-auto text-center rounded-full border border-black/10 bg-brand-lime hover:bg-brand-limeDark text-brand-charcoal font-semibold py-2.5 px-5 shadow-soft"
                  >
                    Register Now
                  </Link>
                )
            : (
              <Link
                to="/register"
                className="w-full sm:w-auto text-center rounded-full border border-black/10 bg-brand-lime hover:bg-brand-limeDark text-brand-charcoal font-semibold py-2.5 px-5 shadow-soft"
              >
                Register Now
              </Link>
            )}
        </div>
      </div>
    </article>
  );
};

export default EventCard;
