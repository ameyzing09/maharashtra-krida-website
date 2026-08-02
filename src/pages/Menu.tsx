import React from "react";
import { Link } from "react-router-dom";
import { MotionGrid, MotionItem } from "../component/common/motion";

const menuLinkClass =
  "glass-panel block w-full px-5 py-4 text-center text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-orange-200 dark:hover:border-orange-400/30 hover:shadow-md transition-[border-color,box-shadow]";

const Menu: React.FC = () => {
  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400">
      <div className="glass-panel p-6 sm:p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100 mb-8">Admin Menu</h1>
        <MotionGrid className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MotionItem><Link to="/menu/content-management" className={menuLinkClass}>Content Management</Link></MotionItem>
          <MotionItem><Link to="/menu/event-management" className={menuLinkClass}>Event Management</Link></MotionItem>
          <MotionItem><Link to="/menu/gallery-management" className={menuLinkClass}>Gallery Management</Link></MotionItem>
          <MotionItem><Link to="/menu/news-management" className={menuLinkClass}>News Management</Link></MotionItem>
          <MotionItem><Link to="/menu/tournaments" className={menuLinkClass}>Tournament Manager</Link></MotionItem>
          <MotionItem><Link to="/menu/badminton-registrations" className={menuLinkClass}>Registration Management</Link></MotionItem>
          <MotionItem className="sm:col-span-2"><Link to="/menu/invoice-settings" className={menuLinkClass}>Invoice Settings</Link></MotionItem>
        </MotionGrid>
      </div>
    </div>
  );
};

export default Menu;
