import { SPINNER_COLOR } from "../constants";
import React, { useState } from "react";
import { SliderImageInput } from "../types";
import useHomepageContent from "../hook/useHomepage";
import { uploadImage } from "../services/storageService";
import { errorMessage } from "../services/error";
import { validateImageFile } from "../utils/fileValidation";
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
  const [submitting, setSubmitting] = useState(false);

  const { toast, showToast } = useToast();

  const uploadFiles = async (file: File, folder: string) => uploadImage(file, folder);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const validationError = validateImageFile(file);
      if (validationError) {
        showToast(validationError, "error");
        event.target.value = "";
        return;
      }
      setSelectedFile(file);
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
    if (!selectedFile) {
      showToast("Please choose an image.", "error");
      return;
    }

    setSubmitting(true);
    let imageUrl: string;
    try {
      imageUrl = await uploadFiles(selectedFile, "sliderImages");
    } catch (error) {
      console.error("HomepageForm: image upload failed", error);
      showToast(errorMessage(error), "error");
      setSubmitting(false);
      return;
    }

    try {
      const completeData = { ...formData, imageUrl };
      if (isUpdating && updateId) {
        await handleUpdateContent(updateId, completeData);
        showToast("Content updated successfully.", "success");
      } else {
        await handleAddContent(completeData);
        showToast("Content added successfully.", "success");
      }
      resetForm();
    } catch (error) {
      console.error("HomepageForm: save failed", error);
      showToast(errorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <TailSpin color={SPINNER_COLOR} height={80} width={80} />
      </div>
    );
  }

  return (
    <>
    {toast && <Toast message={toast.message} type={toast.type} />}
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-8 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-center mb-6">Add New Homepage Content</h2>
      <div className="mb-4">
        <label className="block text-slate-600 dark:text-slate-300 text-sm font-bold mb-2" htmlFor="title">
          Title
        </label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="glass-input w-full py-2 px-3" required />
      </div>
      <div className="mb-4">
        <label className="block text-slate-600 dark:text-slate-300 text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="glass-input w-full py-2 px-3" required />
      </div>
      <div className="mb-4">
        <label className="block text-slate-600 dark:text-slate-300 text-sm font-bold mb-2" htmlFor="imageFile">
          Image
        </label>
        <input type="file" name="imageFile" accept="image/*" onChange={handleFileChange} className="glass-file-input w-full" required />
      </div>
      <div className="flex items-center justify-between">
        <button type="submit" disabled={submitting} className="glass-button-primary font-bold py-2 px-4 disabled:opacity-60">
          Add Content
        </button>
      </div>
    </form>
    </>
  );
};

export default HomepageForm;
