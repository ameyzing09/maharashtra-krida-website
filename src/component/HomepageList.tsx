import React, { useState } from 'react';
import usePagination from '../hook/usePagination'; // Import the usePagination hook from the hook folder
import useHomepageContent from '../hook/useHomepage';
import Pagination from './Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { calculateEventsPerPage } from '..';
import useToast from '../hook/useToast';
import Toast from './common/Toast';

const HomepageList: React.FC = () => {
    const [contentPerPage] = useState(calculateEventsPerPage());
    const { content, handleDeleteContent } = useHomepageContent();
    const { currentData, nextPage, prevPage, currentPage, maxPage, jumpPage } = usePagination(content, contentPerPage);
    const { toast, showToast } = useToast();

    const handleDelete = (id: string) => async () => {
        try {
            await handleDeleteContent(id);
            showToast('Content deleted successfully.', 'success');
        } catch (error) {
            showToast('Failed to delete content.', 'error');
        }
    };

    return (
        <>
        {toast && <Toast message={toast.message} type={toast.type} />}
        <div className="container mx-auto text-brand-charcoal dark:text-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Event List</h2>
          {currentData().length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No events added yet.</p>
          ) : (
            <ul className="grid gap-4">
              {currentData().map((item) => (
                <li key={item.id} className="p-4 bg-white dark:bg-brand-slate border border-black/5 dark:border-white/10 shadow rounded-lg">
                <div className="font-bold text-brand-charcoal dark:text-gray-100">{item.title}</div>
                <div className="text-gray-600 dark:text-gray-300">{item.description}</div>
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    onClick={handleDelete(item.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  {/* <button
                      onClick={() => handleUpdateContent(item.id, item)}
                      className="flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button> */}
                </div>
              </li>
                ))}
                </ul>
                )}
            <Pagination currentPage={currentPage} nextPage={nextPage} prevPage={prevPage} jumpPage={jumpPage} maxPage={maxPage} />
        </div>
        </>
    );
};

export default HomepageList;
