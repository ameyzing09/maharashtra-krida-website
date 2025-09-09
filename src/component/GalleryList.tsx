import { useEffect, useState } from "react";
import PageLoader from "./PageLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { calculateEventsPerPage } from "..";
import usePagination from "../hook/usePagination";
import Pagination from "./Pagination";
import useToast from "../hook/useToast";
import Toast from "./common/Toast";
import { GalleryItem, deleteGalleryItem, listGallery } from "../services/galleryService";

type Props = { refreshKey?: number };

export default function GalleryList({ refreshKey }: Props) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      setItems(await listGallery());
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const onDelete = async (id: string) => {
    try {
      await deleteGalleryItem(id);
      setItems((list) => list.filter((x) => x.id !== id));
      showToast("Item deleted.", "success");
    } catch (e) {
      showToast("Failed to delete.", "error");
    }
  };

  const [perPage] = useState(calculateEventsPerPage());
  const { currentData, nextPage, prevPage, jumpPage, currentPage, maxPage } = usePagination(items, perPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <PageLoader variant="center" label="Loading gallery..." />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  const pageItems = currentData();

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="container mx-auto text-brand-charcoal dark:text-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Gallery Items</h2>
        {pageItems.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No items yet.</p>
        ) : (
          <ul className="grid gap-4">
            {pageItems.map((it) => (
              <li key={it.id} className="p-4 bg-white dark:bg-brand-slate border border-black/5 dark:border-white/10 shadow rounded-lg">
                <div className="flex items-center gap-3">
                  {it.imageUrl && (
                    <img src={it.imageUrl} alt={it.alt || it.title || "Gallery"} className="h-16 w-24 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{it.title || "Untitled"}</div>
                    {it.description && <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{it.description}</div>}
                  </div>
                  <div className="ml-auto">
                    <button onClick={() => onDelete(it.id)} className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination currentPage={currentPage} nextPage={nextPage} prevPage={prevPage} jumpPage={jumpPage} maxPage={maxPage} />
      </div>
    </>
  );
}

