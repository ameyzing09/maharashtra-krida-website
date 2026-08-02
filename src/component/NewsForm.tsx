import { useEffect, useState } from "react";
import PageLoader from "./PageLoader";
import { uploadImage } from "../services/storageService";
import { errorMessage } from "../services/error";
import { validateImageFile } from "../utils/fileValidation";
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
        console.error("NewsForm: failed to load events for dropdown", e);
      } finally {
        setEventsLoading(false);
      }
    })();
  }, []);

  // Shared by the text inputs, the textarea and the event <select>. Only an
  // <input> carries `files`, so narrow before reaching for it.
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.name === "imageFile") {
      const picked = target.files?.[0];
      if (picked) {
        const validationError = validateImageFile(picked);
        if (validationError) {
          showToast(validationError, "error");
          target.value = "";
          return;
        }
        setFile(picked);
      }
      return;
    }
    setForm((f) => ({ ...f, [target.name]: target.value }));
  };

  const upload = async (f: File) => uploadImage(f, "news");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast("Title is required.", "error");
      return;
    }
    if (!form.content?.trim()) {
      showToast("Content is required.", "error");
      return;
    }

    setLoading(true);
    let imageUrl: string | undefined;
    try {
      imageUrl = file ? await upload(file) : undefined;
    } catch (e) {
      console.error("NewsForm: image upload failed", e);
      showToast(errorMessage(e), "error");
      setLoading(false);
      return;
    }

    try {
      await addNewsItem({ title: form.title.trim(), summary: form.summary?.trim() || undefined, content: form.content?.trim(), imageUrl, eventId: form.eventId || undefined });
      showToast("News added.", "success");
      setForm({ title: "" });
      setFile(null);
      onAdded?.();
    } catch (e) {
      console.error("NewsForm: addNewsItem failed", e);
      showToast(errorMessage(e), "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader variant="overlay" label="Saving news..." />;
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <form onSubmit={onSubmit} className="max-w-lg mx-auto glass-panel-strong text-slate-900 dark:text-slate-100 p-6">
        <h2 className="text-xl font-semibold text-center mb-4 text-slate-900 dark:text-slate-100">Add News</h2>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100" htmlFor="title">Title</label>
          <input name="title" value={form.title} onChange={onChange} placeholder="Title" className="glass-input w-full py-2 px-3" required />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100" htmlFor="eventId">Related Event (optional)</label>
          <select
            name="eventId"
            value={form.eventId || ""}
            onChange={onChange}
            className="glass-input w-full py-2 px-3"
            disabled={eventsLoading}
          >
            <option value="">None</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100" htmlFor="summary">Summary (optional)</label>
          <input name="summary" value={form.summary || ""} onChange={onChange} placeholder="Short summary" className="glass-input w-full py-2 px-3" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100" htmlFor="content">Content</label>
          <textarea name="content" value={form.content || ""} onChange={onChange} placeholder="Full content" rows={6} className="glass-input w-full py-2 px-3" required />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100" htmlFor="imageFile">Cover Image (optional)</label>
          <input name="imageFile" type="file" accept="image/*" onChange={onChange} className="glass-file-input w-full" />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" disabled={loading} className="glass-button-primary py-2 px-4 disabled:opacity-60">Add</button>
        </div>
      </form>
    </>
  );
}
