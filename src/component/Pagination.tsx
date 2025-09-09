import { motion } from "framer-motion";
interface PaginationProps {
  currentPage: number;
  maxPage: number;
  nextPage: () => void;
  prevPage: () => void;
  jumpPage: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  maxPage,
  nextPage,
  prevPage,
  jumpPage,
}) => {
  const pageNumbers = Array.from({ length: maxPage }, (_, i) => i + 1);

  return (
    <nav>
      <ul className="flex justify-center space-x-1 sm:space-x-2 mt-4 overflow-x-auto pb-2">
        <li>
          <motion.button
            onClick={prevPage}
            disabled={currentPage === 1}
            whileHover={{ y: currentPage === 1 ? 0 : -1 }}
            whileTap={{ scale: currentPage === 1 ? 1 : 0.98 }}
            className="glass-button-primary py-2 px-3 sm:px-4 text-sm sm:text-base min-w-[44px] min-h-[44px] disabled:opacity-60"
          >
            Prev
          </motion.button>
        </li>
        {pageNumbers.map((number) => (
          <li key={number} className="flex">
            <motion.button
              onClick={() => jumpPage(number)}
              whileHover={{ y: number === currentPage ? 0 : -1 }}
              whileTap={{ scale: number === currentPage ? 1 : 0.98 }}
              className={`py-2 px-3 sm:px-4 text-sm sm:text-base min-w-[44px] min-h-[44px] ${
                currentPage === number ? "glass-button-primary" : "glass-button-secondary"
              }`}
            >
              {number}
            </motion.button>
          </li>
        ))}
        <li>
          <motion.button
            onClick={nextPage}
            disabled={currentPage === maxPage}
            whileHover={{ y: currentPage === maxPage ? 0 : -1 }}
            whileTap={{ scale: currentPage === maxPage ? 1 : 0.98 }}
            className="glass-button-primary py-2 px-3 sm:px-4 text-sm sm:text-base min-w-[44px] min-h-[44px] disabled:opacity-60"
          >
            Next
          </motion.button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
