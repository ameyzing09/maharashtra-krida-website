import React, { useState } from "react";
import { toast } from "react-toastify";
import { addEvent } from "../services/eventService";
import { uploadImage } from "../services/storageService";
import { errorMessage } from "../services/error";
import { validateImageFile, validateUploadFile } from "../utils/fileValidation";
import PageLoader from "./PageLoader";
import useEvents from "../hook/useEvents";

const EventForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    date: "",
    location: "",
    imageUrl: "",
    flyerUrl: "",
    registrationUrl: "",
    description: "",
  });
  // const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { handleEventChange } = useEvents();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (name === "imageFile" || name === "flyerFile") {
      if (files && files[0]) {
        const file = files[0];
        const validationError =
          name === "imageFile" ? validateImageFile(file) : validateUploadFile(file, ["image/", "application/pdf"]);
        if (validationError) {
          toast.error(validationError);
          e.target.value = "";
          return;
        }
        name === "imageFile" ? setImageFile(file) : setFlyerFile(file);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please upload an image file.");
      return;
    }

    setLoading(true);
    let imageUrl: string;
    let flyerUrl: string;
    try {
      [imageUrl, flyerUrl] = await Promise.all([
        uploadImage(imageFile, "images"),
        flyerFile ? uploadImage(flyerFile, "flyers") : Promise.resolve(""),
      ]);
    } catch (error) {
      console.error("EventForm: image/flyer upload failed", error);
      toast.error(errorMessage(error));
      setLoading(false);
      return;
    }

    try {
      await addEvent({
        ...formData,
        imageUrl,
        flyerUrl,
      });
      toast.success("Event added successfully.");
      setFormData({
        name: "",
        sport: "",
        date: "",
        location: "",
        imageUrl: "",
        flyerUrl: "",
        registrationUrl: "",
        description: "",
      });
      setImageFile(null);
      setFlyerFile(null);
      handleEventChange();
    } catch (error) {
      console.error("EventForm: addEvent failed", error);
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader variant="center" label="Adding Event..." />;
  }

  return (
    <form
    onSubmit={handleSubmit}
    className="max-w-lg mx-auto glass-panel-strong text-slate-900 dark:text-slate-100 p-8"
  >
    <h2 className="text-2xl font-semibold text-center mb-6 text-slate-900 dark:text-slate-100">Add New Event</h2>
    <div className="mb-4">
      <label
        className="block text-slate-900 dark:text-slate-100 text-sm font-bold mb-2"
        htmlFor="name"
      >
        Event Name
      </label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Event Name"
        className="glass-input w-full py-2 px-3"
        required
      />
    </div>
    <div className="mb-4">
      <label
        className="block text-slate-900 dark:text-slate-100 text-sm font-bold mb-2"
        htmlFor="sport"
      >
        Sport Type
      </label>
      <input
        type="text"
        name="sport"
        value={formData.sport}
        onChange={handleChange}
        placeholder="Sport Type"
        className="glass-input w-full py-2 px-3"
        required
      />
    </div>
    <div className="mb-4">
      <label
        className="block text-slate-900 dark:text-slate-100 text-sm font-bold mb-2"
        htmlFor="date"
      >
        Date
      </label>
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className="glass-input w-full py-2 px-3"
        required
      />
    </div>
    <div className="mb-4">
      <label
        className="block text-slate-900 dark:text-slate-100 text-sm font-bold mb-2"
        htmlFor="location"
      >
        Location
      </label>
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location"
        className="glass-input w-full py-2 px-3"
        required
      />
    </div>
    <div className="mb-4">
      <label
        className="block text-slate-900 dark:text-slate-100 text-sm font-bold mb-2"
        htmlFor="imageFile"
      >
        Event Image
      </label>
      <input
        type="file"
        name="imageFile"
        accept="image/*"
        onChange={handleChange}
        className="glass-file-input w-full"
      />
    </div>
    <div className="mb-4">
      <label
        className="block text-slate-900 dark:text-slate-100 text-sm font-bold mb-2"
        htmlFor="flyerUrl"
      >
        Flyer URL (optional)
      </label>
      <input
        type="file"
        name="flyerFile"
        accept="image/*,application/pdf"
        onChange={handleChange}
        className="glass-file-input w-full"
      />
    </div>
    <div className="mb-4">
      <label
        className="block text-slate-900 dark:text-slate-100 text-sm font-bold mb-2"
        htmlFor="registrationUrl"
      >
        Registration URL (optional)
      </label>
      <input
        type="text"
        name="registrationUrl"
        value={formData.registrationUrl}
        onChange={handleChange}
        placeholder="Leave blank to show &quot;Registration opening soon&quot;"
        className="glass-input w-full py-2 px-3"
      />
    </div>
    <div className="mb-6">
      <label
        className="block text-slate-900 dark:text-slate-100 text-sm font-bold mb-2"
        htmlFor="description"
      >
        Description
      </label>
      <input
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="glass-input w-full py-2 px-3"
        required
      />
    </div>
    <div className="flex items-center justify-between">
      <button
        type="submit"
        disabled={loading}
        className="glass-button-primary w-full py-2 px-4 disabled:opacity-60"
      >
        Add Event
      </button>
    </div>
    {/* {error && <p className="text-red-500 text-center mt-4">{error}</p>} */}
  </form>
  );
};

export default EventForm;
