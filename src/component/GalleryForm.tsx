import { useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { TailSpin } from "react-loader-spinner";
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
    const { name, value, files } = e.target as any;
    if (name === "imageFile") {
      if (files?.[0]) setFile(files[0]);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const upload = async (f: File) => {
    const storage = getStorage();
    const ts = Date.now();
    const storageRef = ref(storage, `gallery/${ts}_${f.name}`);
    const snap = await uploadBytes(storageRef, f);
    return await getDownloadURL(snap.ref);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      showToast("Please choose an image.", "error");
      return;
    }
    try {
      setLoading(true);
      const imageUrl = await upload(file);
      await addGalleryItem({ imageUrl, title: form.title?.trim() || undefined, description: form.description?.trim() || undefined, alt: form.alt?.trim() || undefined });
      showToast("Gallery item added.", "success");
      setForm({});
      setFile(null);
      onAdded?.();
    } catch (err) {
      console.error(err);
      showToast("Failed to add item.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <TailSpin color="#a3e635" height={40} width={40} />
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <form onSubmit={onSubmit} className="max-w-lg mx-auto bg-white dark:bg-brand-slate border border-black/5 dark:border-white/10 text-brand-charcoal dark:text-gray-100 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-center mb-4">Add Gallery Item</h2>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1" htmlFor="title">Title (optional)</label>
          <input name="title" value={form.title || ""} onChange={onChange} placeholder="Title" className="shadow appearance-none border rounded w-full py-2 px-3 bg-transparent" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1" htmlFor="description">Description (optional)</label>
          <input name="description" value={form.description || ""} onChange={onChange} placeholder="Short description" className="shadow appearance-none border rounded w-full py-2 px-3 bg-transparent" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1" htmlFor="alt">Alt text (accessibility)</label>
          <input name="alt" value={form.alt || ""} onChange={onChange} placeholder="Image alt text" className="shadow appearance-none border rounded w-full py-2 px-3 bg-transparent" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1" htmlFor="imageFile">Image</label>
          <input name="imageFile" type="file" accept="image/*" onChange={onChange} className="shadow border rounded w-full py-2 px-3 bg-transparent file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-black/5 dark:file:bg-white/10" />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" className="bg-lime-400 hover:bg-lime-600 text-brand-charcoal font-bold py-2 px-4 rounded border border-black/10">Add</button>
        </div>
      </form>
    </>
  );
}

