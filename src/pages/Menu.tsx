import React from "react";
import { Link } from "react-router-dom";

const Menu: React.FC = () => {
  return (
    <div className="h-screen p-4 flex flex-col items-center justify-center bg-brand-paper dark:bg-brand-charcoal text-brand-charcoal dark:text-gray-200">
      <div className="space-y-4 text-lg">
        <Link to="/menu/content-management" className="block px-6 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Content Management</Link>
        <Link to="/menu/event-management" className="block px-6 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Event Management</Link>
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
