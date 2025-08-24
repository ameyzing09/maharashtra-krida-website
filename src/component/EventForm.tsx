import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { toast } from "react-toastify";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { collections } from "../constants";
import { TailSpin } from "react-loader-spinner";
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
        name === "imageFile" ? setImageFile(files[0]) : setFlyerFile(files[0]);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const uploadFiles = async (file: File, folder: string) => {
    const storage = getStorage();
    const timeStamp = new Date().getTime();
    const storageRef = ref(storage, `${folder}/${formData.name}_${timeStamp}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const fileDownloadURL = await getDownloadURL(snapshot.ref);
    return fileDownloadURL;
  }

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (imageFile && flyerFile) {
      try {
        setLoading(true);
        const uploadFilesPromises = [uploadFiles(imageFile, "images"), uploadFiles(flyerFile, "flyers")];
        const [imageUrl, flyerUrl] = await Promise.all(uploadFilesPromises);
        await addDoc(collection(db, collections.EVENTS), {
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
        console.error("Error adding document: ", error);
        toast.error("Failed to add event.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please upload an image file.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <TailSpin color="#a3e635" height={80} width={80} />
      </div>
    );
  }

  return (
    <form
    onSubmit={handleSubmit}
    className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow"
  >
    <h2 className="text-2xl font-semibold text-center mb-6">Add New Event</h2>
    <div className="mb-4">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
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
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
      />
    </div>
    <div className="mb-4">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
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
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
      />
    </div>
    <div className="mb-4">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor="date"
      >
        Date
      </label>
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
      />
    </div>
    <div className="mb-4">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
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
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
      />
    </div>
    <div className="mb-4">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor="imageFile"
      >
        Event Image
      </label>
      <input
        type="file"
        name="imageFile"
        onChange={handleChange}
        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
    <div className="mb-4">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor="flyerUrl"
      >
        Flyer URL
      </label>
      <input
        type="file"
        name="flyerFile"
        onChange={handleChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
    <div className="mb-4">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor="registrationUrl"
      >
        Registration URL
      </label>
      <input
        type="text"
        name="registrationUrl"
        value={formData.registrationUrl}
        onChange={handleChange}
        placeholder="Registration URL"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
    <div className="mb-6">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor="description"
      >
        Description
      </label>
      <input
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
      />
    </div>
    <div className="flex items-center justify-between">
      <button
        type="submit"
        className="bg-lime-400 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Add Event
      </button>
    </div>
    {/* {error && <p className="text-red-500 text-center mt-4">{error}</p>} */}
  </form>
  );
};

export default EventForm;
