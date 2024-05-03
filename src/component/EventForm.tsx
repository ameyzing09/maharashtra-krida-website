// src/components/EventForm.js

import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { toast } from "react-toastify";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const EventForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    date: "",
    location: "",
    imageUrl: "",
    flyerUrl: "",
    description: "",
  });

  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "imageFile") {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (file) {
      const storage = getStorage();
      const storageRef = ref(storage, `images/${file.name}`);
      await uploadBytes(storageRef, file)
        .then((snapshot) => {
          return getDownloadURL(snapshot.ref);
        })
        .then((downloadURL) => {
          setFormData((prev) => ({ ...prev, imageUrl: downloadURL }));
          return addDoc(collection(db, "events"), {
            ...formData,
            imageUrl: downloadURL,
          });
        })
        .then(() => {
          toast.success("Event added successfully!");
          setFormData({
            name: "",
            sport: "",
            date: "",
            location: "",
            imageUrl: "",
            flyerUrl: "",
            description: "",
          });
          setFile(null);
        })
        .catch((error) => {
          toast.error("Error adding event: " + error.message);
        });
    } else {
      toast.error("Please upload an image file.");
    }
  };

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
          type="text"
          name="flyerUrl"
          value={formData.flyerUrl}
          onChange={handleChange}
          placeholder="Flyer URL"
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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Event
        </button>
      </div>
    </form>
  );
};

export default EventForm;
