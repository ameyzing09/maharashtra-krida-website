interface PaginationProps {
    eventsPerPage: number
    totalEvents: number
    paginate: (pageNumber: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ eventsPerPage, totalEvents, paginate }) => {
  const pageNumbers = [];
  for (let i = 1; i < Math.ceil(totalEvents / eventsPerPage); i++) {
    pageNumbers.push(i);
  }
  return (
    <nav>
      <ul className="flex justify-center space-x-2 mt-4">
        {pageNumbers.map((number) => (
          <li key={number} className="flex">
            <button
              onClick={() => paginate(number)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination
