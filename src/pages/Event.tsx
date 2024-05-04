import { useState } from "react";
import SkeletonLoader from "../component/SkeletonLoader";
import EventCard from "../component/EventCard";

import { calculateEventsPerPage } from "..";
import Pagination from "../component/Pagination";
import useEvents from "../hook/useEvents";

export default function Event() {
  const [currentPage, setCurrentPage] = useState(1)
  const [eventsPerPage] = useState(calculateEventsPerPage())

  const { eventsList, loading , error } = useEvents()

  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = eventsList.slice(indexOfFirstEvent, indexOfLastEvent)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: indexOfLastEvent }).map((_, idx) => (
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
        {currentEvents.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
      <Pagination eventsPerPage={eventsPerPage} totalEvents={eventsList.length} paginate={paginate} />
    </div>
  );
}
