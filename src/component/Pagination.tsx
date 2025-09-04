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
      <ul className="flex justify-center space-x-2 mt-4">
        <li>
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="bg-lime-400 hover:bg-lime-600 text-brand-charcoal dark:text-brand-charcoal font-bold py-2 px-4 rounded border border-black/10 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out disabled:opacity-60"
          >
            Prev
          </button>
        </li>
        {pageNumbers.map((number) => (
          <li key={number} className="flex">
            <button
              onClick={() => jumpPage(number)}
              className={`bg-lime-400 hover:bg-lime-600 font-bold py-2 px-4 rounded border border-black/10 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out ${
                currentPage === number ? "bg-lime-600 text-white" : "text-brand-charcoal dark:text-brand-charcoal"
              }`}
            >
              {number}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={nextPage}
            disabled={currentPage === maxPage}
            className="bg-lime-400 hover:bg-lime-600 text-brand-charcoal dark:text-brand-charcoal font-bold py-2 px-4 rounded border border-black/10 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out disabled:opacity-60"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
