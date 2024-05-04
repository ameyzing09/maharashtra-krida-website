import { toast } from "react-toastify";
import EventForm from "../component/EventForm";
import EventList from "../component/EventList";
import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { TailSpin } from "react-loader-spinner";

const EventOperation = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Sign out failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <TailSpin color="#a3e635" height={80} width={80} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Sports Management</h1>
        <button
          type="submit"
          className="bg-lime-400 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
      <p className="text-lg mb-6">
        Welcome to the event management page. Here you can add new events and
        view existing events.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Add Event</h2>
          <EventForm />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">View Events</h2>
          <EventList />
        </div>
      </div>
    </div>
  );
};

export default EventOperation;
