import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-lime-400 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Maharashtra Krida</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="/" className="hover:text-vivid-orange-500">Home</a></li>
            <li><a href="/about" className="hover:text-vivid-orange-500">About</a></li>
            <li><a href="/contact" className="hover:text-vivid-orange-500">Contact</a></li>
            <li><a href="/upcoming-events" className="hover:text-vivid-orange-500">Events</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
