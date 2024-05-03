import { useEffect, useState } from "react";
import SkeletonLoader from "../component/SkeletonLoader";
import EventCard from "../component/EventCard";
import { getEvents } from "../services/eventService";
import { EventProps } from "../types";
import { calculateEventsPerPage } from "..";
import { errorConstants } from "../constants/errorConstant";
import Pagination from "../component/Pagination";

export default function Event() {
  const [eventsList, setEventsList] = useState<EventProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [eventsPerPage] = useState(calculateEventsPerPage())

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
      const eventsDetails = await getEvents();
      setEventsList(eventsDetails);
      setError("");
      } catch (error) {
        setError(errorConstants.FAILED_TO_FETCH_EVENTS_DETAILS)
        console.error(error)
      } finally {
        setLoading(false)
      }
    };
    fetchEvents();
  }, []);

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
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentEvents.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
      <Pagination eventsPerPage={eventsPerPage} totalEvents={eventsList.length} paginate={paginate} />
    </div>
  );
}
