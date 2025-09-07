import { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import useToast from "../hook/useToast";
import Toast from "./common/Toast";
import { NewsItem, deleteNewsItem, listNews } from "../services/newsService";
import usePagination from "../hook/usePagination";
import Pagination from "./Pagination";
import { calculateEventsPerPage } from "..";

type Props = { refreshKey?: number };

export default function NewsList({ refreshKey }: Props) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      setItems(await listNews(50));
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to load news");
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
      await deleteNewsItem(id);
      setItems((list) => list.filter((x) => x.id !== id));
      showToast("News deleted.", "success");
    } catch (e) {
      showToast("Failed to delete.", "error");
    }
  };

  const [perPage] = useState(calculateEventsPerPage());
  const { currentData, nextPage, prevPage, jumpPage, currentPage, maxPage } = usePagination(items, perPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <TailSpin color="#a3e635" height={40} width={40} />
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
        <h2 className="text-2xl font-semibold mb-4">News List</h2>
        {pageItems.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No news added yet.</p>
        ) : (
          <ul className="grid gap-4">
            {pageItems.map((n) => (
              <li key={n.id} className="p-4 bg-white dark:bg-brand-slate border border-black/5 dark:border-white/10 shadow rounded-lg">
                <div className="flex items-start gap-3">
                  {n.imageUrl && (
                    <img src={n.imageUrl} alt={n.title} className="h-16 w-24 object-cover rounded flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="font-bold text-brand-charcoal dark:text-gray-100 break-words line-clamp-1">{n.title}</div>
                    {n.summary && <div className="mt-0.5 text-sm text-gray-600 dark:text-gray-300 break-words line-clamp-2">{n.summary}</div>}
                  </div>
                  <div className="ml-auto">
                    <button onClick={() => onDelete(n.id)} className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
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
