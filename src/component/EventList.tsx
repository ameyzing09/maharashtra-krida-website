import { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import useEvents from "../hook/useEvents";
import usePagination from "../hook/usePagination";
import Pagination from "./Pagination";
import { calculateEventsPerPage } from "..";

const EventsList = () => {
  const [eventsPerPage] = useState(calculateEventsPerPage());
  const { eventsList, loading, error, handleEventDelete } = useEvents();

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
      <div className="flex justify-center items-center h-screen">
        <TailSpin color="#a3e635" height={80} width={80} />
      </div>
    );
  }

  if (error)
    return (
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <h1>{error}</h1>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-brand-charcoal dark:text-gray-100">Event List</h2>
      {currentData().length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No events added yet.</p>
      ) : (
        <ul className="grid gap-4">
          {currentData().map((event) => (
            <li key={event.id} className="p-4 bg-white dark:bg-brand-slate border border-black/5 dark:border-white/10 shadow rounded-lg">
              <div className="font-bold text-brand-charcoal dark:text-gray-100">{event.name}</div>
              <div className="text-gray-600 dark:text-gray-300">{event.sport}</div>
              <div className="text-gray-600 dark:text-gray-300">{event.date}</div>
              <div className="text-gray-600 dark:text-gray-300">{event.location}</div>
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => handleEventDelete(event.id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                {/* <button
                    onClick={() => handleEdit(event.id)}
                    className="flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button> */}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination currentPage={currentPage} nextPage={nextPage} prevPage={prevPage} jumpPage={jumpPage} maxPage={maxPage} />

    </div>
  );
};

export default EventsList;
