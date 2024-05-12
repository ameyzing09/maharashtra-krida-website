import React from "react";
import { Link } from "react-router-dom";

const Menu: React.FC = () => {
  return (
    <div className="bg-gray-800 text-white p-4 flex flex-col items-center justify-center h-screen">
      <div className="space-y-4 text-lg">
        <Link to="/content-management" className="block px-6 py-2 hover:bg-gray-700 rounded">Content Management</Link>
        <Link to="/event-management" className="block px-6 py-2 hover:bg-gray-700 rounded">Event Management</Link>
        {/* <ul className="flex space-x-4">
          <li>

            <a
              href="/content-management"
              className="hover:text-vivid-orange-500"
            >
              Content Management
            </a>
          </li>

          <li>
            <a href="/event-management" className="hover:text-vivid-orange-500">
              Event Management
            </a>
          </li>
        </ul> */}
      </div>
    </div>
  );
};

export default Menu;
