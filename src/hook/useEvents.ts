import { useCallback, useEffect, useState } from "react";
import { errorConstants } from "../constants/errorConstant";
import { getEvents } from "../services/eventService";
import { EventProps } from "../types";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { collections } from "../constants";

const useEvents = () => {
  const [eventsList, setEventsList] = useState<EventProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const eventsDetails = await getEvents();
      setEventsList(eventsDetails);
      setError("");
    } catch (error) {
      setError(errorConstants.FAILED_TO_FETCH_EVENTS_DETAILS);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventChange = () => {
    fetchEvents();
  }

  const handleEventDelete = async (eventId: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, collections.EVENTS, eventId));
      const updatedEventsList = eventsList.filter(
        (event) => event.id !== eventId
      );
      setEventsList(updatedEventsList);
      setError("");
    } catch (error) {
      setError(errorConstants.FAILED_TO_DELETE_EVENT);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { eventsList, loading, error, handleEventDelete, handleEventChange };
};

export default useEvents;
