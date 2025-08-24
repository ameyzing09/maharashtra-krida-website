import React from "react";
import { Link } from "react-router-dom";
import { EventProps } from "../types";

// if your EventProps doesn't have this yet, add:
// registrationUrl?: string;
type CardProps = EventProps & { registrationUrl?: string };

const isExternal = (url?: string) => !!url && /^https?:\/\//i.test(url);

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
    <div className="w-full rounded-lg overflow-hidden bg-white shadow transition hover:shadow-lg">
      <img
        className="w-full h-40 sm:h-48 md:h-56 object-cover"
        src={imageUrl}
        alt={name}
      />

      <div className="p-4 sm:p-6 flex flex-col justify-between min-h-[260px]">
        {/* title + desc */}
        <div>
          <h3 className="font-bold text-lg sm:text-xl mb-2 line-clamp-2">{name}</h3>
          <p
            className="text-gray-700 text-sm sm:text-base"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        </div>

        {/* tags */}
        <div className="pt-4 flex flex-wrap gap-2">
          {sport && (
            <span className="inline-flex bg-gray-200 rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-gray-700">
              {sport}
            </span>
          )}
          {date && (
            <span className="inline-flex bg-gray-200 rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-gray-700">
              {date}
            </span>
          )}
          {location && (
            <span className="inline-flex bg-gray-200 rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-gray-700">
              {location}
            </span>
          )}
        </div>

        {/* actions */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          {flyerUrl && (
            <a
              href={flyerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center bg-lime-400 hover:bg-lime-500 text-white font-semibold py-2 px-4 rounded"
            >
              View Flyer
            </a>
          )}

          {/* If registrationUrl is present, use it; internal or external both supported.
              Otherwise, fall back to /register */}
          {registrationUrl ? (
            isExternal(registrationUrl) ? (
              <a
                href={registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto text-center bg-lime-400 hover:bg-lime-500 text-white font-semibold py-2 px-4 rounded"
              >
                Register Now
              </a>
            ) : (
              <Link
                to={registrationUrl}
                className="w-full sm:w-auto text-center bg-lime-400 hover:bg-lime-500 text-white font-semibold py-2 px-4 rounded"
              >
                Register Now
              </Link>
            )
          ) : (
            <Link
              to="/register"
              className="w-full sm:w-auto text-center bg-lime-400 hover:bg-lime-500 text-white font-semibold py-2 px-4 rounded"
            >
              Register Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
