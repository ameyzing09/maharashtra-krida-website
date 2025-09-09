import React, { useState } from "react";
import { SliderImageInput } from "../types";
import useHomepageContent from "../hook/useHomepage";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { TailSpin } from "react-loader-spinner";
import Toast from "./common/Toast";
import useToast from "../hook/useToast";

const HomepageForm: React.FC = () => {
  const { loading, handleAddContent, handleUpdateContent } = useHomepageContent();
  const [formData, setFormData] = useState<SliderImageInput>({
    imageUrl: "",
    alt: "",
    title: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateId, setUpdateId] = useState<string | null>(null);

  const { toast, showToast } = useToast();

  const uploadFiles = async (file: File, folder: string) => {
    const storage = getStorage();
    const timeStamp = new Date().getTime();
    const storageRef = ref(
      storage,
      `${folder}/${formData.title}_${timeStamp}_${file.name}`
    );
    const snapshot = await uploadBytes(storageRef, file);
    const fileDownloadURL = await getDownloadURL(snapshot.ref);
    return fileDownloadURL;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const resetForm = () => {
    setFormData({ imageUrl: "", alt: "", title: "", description: "" });
    setSelectedFile(null);
    setIsUpdating(false);
    setUpdateId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFile) {
      try {
        const imageUrl = await uploadFiles(selectedFile, "sliderImages");
        showToast("Image uploaded successfully.", "success");
        const completeData = { ...formData, imageUrl };
        if (isUpdating && updateId) {
          await handleUpdateContent(updateId, completeData);
        } else {
          await handleAddContent(completeData);
          showToast("Content added successfully.", "success");
        }
        resetForm();
      } catch (error) {
        console.error("Error handling the form submission:", error);
        showToast("Failed to add content.", "error");
      }
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
    <>
    {toast && <Toast message={toast.message} type={toast.type} />}
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white dark:bg-brand-slate border border-black/5 dark:border-white/10 text-brand-charcoal dark:text-gray-100 p-8 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-center mb-6">Add New Homepage Content</h2>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2" htmlFor="title">
          Title
        </label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="glass-input w-full py-2 px-3" required />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="glass-input w-full py-2 px-3" required />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2" htmlFor="imageFile">
          Image
        </label>
        <input type="file" name="imageFile" onChange={handleFileChange} className="glass-file-input w-full" required />
      </div>
      <div className="flex items-center justify-between">
        <button type="submit" className="bg-lime-400 hover:bg-lime-600 text-brand-charcoal font-bold py-2 px-4 rounded border border-black/10 focus:outline-none focus:shadow-outline">
          Add Content
        </button>
      </div>
    </form>
    </>
  );
};

export default HomepageForm;
