import { useState } from "react";

type UsePaginationReturnType<T> = {
    currentData: () => T[];
    nextPage: () => void;
    prevPage: () => void;
    jumpPage: (pageNumber: number) => void;
    currentPage: number;
    maxPage: number;
  };

const usePagination = <T>(data: T[], itemsPerPage: number): UsePaginationReturnType<T> => {
    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.ceil(data.length / itemsPerPage);

    const currentData = () => {
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return data.slice(begin, end);
    }

    const nextPage = () => {
        setCurrentPage((currentPage) => Math.min(currentPage + 1, maxPage));
    }

    const prevPage = () => {
        setCurrentPage((currentPage) => Math.max(currentPage - 1, 1));
    }

    const jumpPage = (page: number) => {
        const pageNumber = +page
        if (pageNumber !== currentPage && pageNumber > 0 && pageNumber <= maxPage) {
            setCurrentPage(pageNumber);
        }
    }

    return { nextPage, prevPage, jumpPage, currentData, currentPage, maxPage };

}

export default usePagination;