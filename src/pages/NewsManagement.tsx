import NewsForm from "../component/NewsForm";
import NewsList from "../component/NewsList";
import { useState } from "react";

export default function NewsManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="container mx-auto px-4 py-8 text-brand-charcoal dark:text-gray-200">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">News Management</h1>
      </div>
      <p className="text-lg mb-6">Create news items and manage recent updates.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-brand-slate rounded-lg shadow-md p-6 border border-black/5 dark:border-white/10">
          <h2 className="text-xl font-semibold mb-4">Add News</h2>
          <NewsForm onAdded={() => setRefreshKey((k) => k + 1)} />
        </div>
        <div className="bg-white dark:bg-brand-slate rounded-lg shadow-md p-6 border border-black/5 dark:border-white/10">
          <h2 className="text-xl font-semibold mb-4">View News</h2>
          <NewsList refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}

