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
            className="bg-lime-400 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
          >
            Prev
          </button>
        </li>
        {pageNumbers.map((number) => (
          <li key={number} className="flex">
            <button
              onClick={() => jumpPage(number)}
              className={`bg-lime-400 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out ${
                currentPage === number ? "bg-lime-600" : ""
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
            className="bg-lime-400 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
