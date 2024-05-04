import { useState } from "react";
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
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: eventsPerPage }).map((_, idx) => (
            <SkeletonLoader key={idx} />
          ))}
        </div>
      </div>
    );
  }

  if(error) return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <h1>{error}</h1>
      </div>
    </div>
  )

  return (
    <div className="container mt-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentData().map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
      <Pagination currentPage={currentPage} nextPage={nextPage} prevPage={prevPage} jumpPage={jumpPage} maxPage={maxPage} />
    </div>
  );
}
