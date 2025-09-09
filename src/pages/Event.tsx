import { useState } from "react";
import { motion } from "framer-motion";
import SkeletonLoader from "../component/SkeletonLoader";
import EventCard from "../component/EventCard";

import { calculateEventsPerPage } from "..";
import Pagination from "../component/Pagination";
import useEvents from "../hook/useEvents";
import usePagination from "../hook/usePagination";

export default function Event() {
  console.log(calculateEventsPerPage())
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
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white mb-4">Upcoming Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: eventsPerPage }).map((_, idx) => (
            <SkeletonLoader key={idx} />
          ))}
        </div>
      </div>
    );
  }

  if(error) return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white mb-2">Upcoming Events</h1>
      <p className="text-red-600">{error}</p>
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white mb-4">Upcoming Events</h1>
      <motion.div
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
