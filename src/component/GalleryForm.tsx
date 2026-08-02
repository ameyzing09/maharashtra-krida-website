import { useState } from "react";
import { uploadImage } from "../services/storageService";
import { errorMessage } from "../services/error";
import { validateImageFile } from "../utils/fileValidation";
import PageLoader from "./PageLoader";
import useToast from "../hook/useToast";
import Toast from "./common/Toast";
import { addGalleryItem } from "../services/galleryService";

type Props = { onAdded?: () => void };

export default function GalleryForm({ onAdded }: Props) {
  const [form, setForm] = useState<{ title?: string; description?: string; alt?: string }>({});
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      if (files?.[0]) {
        const picked = files[0];
        const validationError = validateImageFile(picked);
        if (validationError) {
          showToast(validationError, "error");
          e.target.value = "";
          return;
        }
        setFile(picked);
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const upload = async (f: File) => uploadImage(f, "gallery");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      showToast("Please choose an image.", "error");
      return;
    }

    setLoading(true);
    let imageUrl: string;
    try {
      imageUrl = await upload(file);
    } catch (err) {
      console.error("GalleryForm: image upload failed", err);
      showToast(errorMessage(err), "error");
      setLoading(false);
      return;
    }

    try {
      await addGalleryItem({ imageUrl, title: form.title?.trim() || undefined, description: form.description?.trim() || undefined, alt: form.alt?.trim() || undefined });
      showToast("Gallery item added.", "success");
      setForm({});
      setFile(null);
      onAdded?.();
    } catch (err) {
      console.error("GalleryForm: addGalleryItem failed", err);
      showToast(errorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader variant="overlay" label="Uploading image..." />;
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <form onSubmit={onSubmit} className="max-w-lg mx-auto glass-panel-strong text-slate-900 dark:text-slate-100 p-6">
        <h2 className="text-xl font-semibold text-center mb-4 text-slate-900 dark:text-slate-100">Add Gallery Item</h2>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100" htmlFor="title">Title (optional)</label>
          <input name="title" value={form.title || ""} onChange={onChange} placeholder="Title" className="glass-input w-full py-2 px-3" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100" htmlFor="description">Description (optional)</label>
          <input name="description" value={form.description || ""} onChange={onChange} placeholder="Short description" className="glass-input w-full py-2 px-3" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100" htmlFor="alt">Alt text (accessibility)</label>
          <input name="alt" value={form.alt || ""} onChange={onChange} placeholder="Image alt text" className="glass-input w-full py-2 px-3" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100" htmlFor="imageFile">Image</label>
          <input name="imageFile" type="file" accept="image/*" onChange={onChange} className="glass-file-input w-full" />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" disabled={loading} className="glass-button-primary py-2 px-4 disabled:opacity-60">Add</button>
        </div>
      </form>
    </>
  );
}

