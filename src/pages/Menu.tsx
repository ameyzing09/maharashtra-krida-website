import React from "react";
import { Link } from "react-router-dom";

const Menu: React.FC = () => {
  return (
    <div className="h-screen p-4 flex flex-col items-center justify-center bg-brand-paper dark:bg-brand-charcoal text-brand-charcoal dark:text-gray-200">
      <div className="glass-panel p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Admin Menu</h1>
        <div className="space-y-4">
          <Link to="/menu/content-management" className="glass-button-secondary w-full py-3 px-6 text-center block">Content Management</Link>
          <Link to="/menu/event-management" className="glass-button-secondary w-full py-3 px-6 text-center block">Event Management</Link>
          <Link to="/menu/gallery-management" className="glass-button-secondary w-full py-3 px-6 text-center block">Gallery Management</Link>
          <Link to="/menu/news-management" className="glass-button-secondary w-full py-3 px-6 text-center block">News Management</Link>
          <Link to="/menu/tournaments" className="glass-button-secondary w-full py-3 px-6 text-center block">Tournament Manager</Link>
        </div>
      </div>
    </div>
  );
};

export default Menu;
