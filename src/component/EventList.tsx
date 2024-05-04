import { TailSpin } from "react-loader-spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import useEvents from "../hook/useEvents";

const EventsList = () => {
  const { eventsList, loading, error, handleDelete } = useEvents();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <TailSpin color="#00BFFF" height={80} width={80} />
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
      <h2 className="text-2xl font-semibold mb-4">Event List</h2>
      {eventsList.length === 0 ? (
        <p className="text-gray-600">No events added yet.</p>
      ) : (
        <ul className="grid gap-4">
          {eventsList.map((event) => (
            <li key={event.id} className="p-4 bg-white shadow rounded-lg">
              <div className="font-bold">{event.name}</div>
              <div className="text-gray-600">{event.sport}</div>
              <div className="text-gray-600">{event.date}</div>
              <div className="text-gray-600">{event.location}</div>
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => handleDelete(event.id)}
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
    </div>
  );
};

export default EventsList;
