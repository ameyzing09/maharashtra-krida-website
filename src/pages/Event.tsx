import { useState } from "react";
import { motion } from "framer-motion";
import SkeletonLoader from "../component/SkeletonLoader";
import EventCard from "../component/EventCard";

import { calculateEventsPerPage } from "..";
import Pagination from "../component/Pagination";
import useEvents from "../hook/useEvents";
import usePagination from "../hook/usePagination";

export default function Event() {
  const [eventsPerPage] = useState(calculateEventsPerPage())

  const { eventsList, loading , error } = useEvents()
  const {
    currentPage,
    nextPage,
    prevPage,
    jumpPage,
    currentData,
    maxPage
  } = usePagination(eventsList, eventsPerPage)
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">Upcoming Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: eventsPerPage }).map((_, idx) => (
            <SkeletonLoader key={idx} />
          ))}
        </div>
      </div>
    );
  }

  if(error) return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Upcoming Events</h1>
      <p className="text-red-600">{error}</p>
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">Upcoming Events</h1>
      {/* key={currentPage} remounts the container on every page change.
          staggerChildren means the parent drives its children — a child with
          only `variants` never animates itself. The parent ran that animation
          once, so cards mounted by a later page stayed at `hidden`, i.e.
          opacity 0: present, sized, invisible.

          animate rather than whileInView: after clicking a page button the
          user is at the bottom of the page, so a freshly remounted grid can be
          above the fold with no intersection to observe, which would reproduce
          the same blank. This grid sits right under the h1 and is in view on
          load anyway, so nothing is lost. */}
      <motion.div
        key={currentPage}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 1 },
          show: { opacity: 1, transition: { staggerChildren: 0.06 } }
        }}
      >
        {currentData().map((event) => (
          <motion.div key={event.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <EventCard {...event} />
          </motion.div>
        ))}
      </motion.div>
      <div className="mt-6">
        <Pagination currentPage={currentPage} nextPage={nextPage} prevPage={prevPage} jumpPage={jumpPage} maxPage={maxPage} />
      </div>
    </div>
  );
}
