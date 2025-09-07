import { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import useToast from "../hook/useToast";
import Toast from "./common/Toast";
import { addNewsItem } from "../services/newsService";
import { getEvents } from "../services/eventService";
import type { EventProps } from "../types";

type Props = { onAdded?: () => void };

export default function NewsForm({ onAdded }: Props) {
  const [form, setForm] = useState<{ title: string; summary?: string; content?: string; eventId?: string }>({ title: "" });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();
  const [events, setEvents] = useState<EventProps[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setEventsLoading(true);
        const list = await getEvents();
        setEvents(list);
      } catch (e) {
        // ignore; dropdown will be empty
      } finally {
        setEventsLoading(false);
      }
    })();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    const storageRef = ref(storage, `news/${ts}_${f.name}`);
    const snap = await uploadBytes(storageRef, f);
    return await getDownloadURL(snap.ref);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content?.trim()) {
      showToast("Title and content are required.", "error");
      return;
    }
    try {
      setLoading(true);
      const imageUrl = file ? await upload(file) : undefined;
      await addNewsItem({ title: form.title.trim(), summary: form.summary?.trim() || undefined, content: form.content?.trim(), imageUrl, eventId: form.eventId || undefined });
      showToast("News added.", "success");
      setForm({ title: "" });
      setFile(null);
      onAdded?.();
    } catch (e) {
      console.error(e);
      showToast("Failed to add news.", "error");
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
        <h2 className="text-xl font-semibold text-center mb-4">Add News</h2>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1" htmlFor="title">Title</label>
          <input name="title" value={form.title} onChange={onChange} placeholder="Title" className="shadow appearance-none border rounded w-full py-2 px-3 bg-transparent" required />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1" htmlFor="eventId">Related Event (optional)</label>
          <select
            name="eventId"
            value={form.eventId || ""}
            onChange={onChange as any}
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-transparent"
            disabled={eventsLoading}
          >
            <option value="">None</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1" htmlFor="summary">Summary (optional)</label>
          <input name="summary" value={form.summary || ""} onChange={onChange} placeholder="Short summary" className="shadow appearance-none border rounded w-full py-2 px-3 bg-transparent" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1" htmlFor="content">Content</label>
          <textarea name="content" value={form.content || ""} onChange={onChange} placeholder="Full content" rows={6} className="shadow appearance-none border rounded w-full py-2 px-3 bg-transparent" required />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1" htmlFor="imageFile">Cover Image (optional)</label>
          <input name="imageFile" type="file" accept="image/*" onChange={onChange} className="shadow border rounded w-full py-2 px-3 bg-transparent file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-black/5 dark:file:bg-white/10" />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" className="bg-lime-400 hover:bg-lime-600 text-brand-charcoal font-bold py-2 px-4 rounded border border-black/10">Add</button>
        </div>
      </form>
    </>
  );
}
