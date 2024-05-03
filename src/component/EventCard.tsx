import React from 'react';
import { EventProps } from '../types';

const EventCard: React.FC<EventProps> = ({ name, sport, date, location, imageUrl, flyerUrl, description }) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <img className="w-full" src={imageUrl} alt={`Flyer for ${name}`} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{name}</div>
        <p className="text-gray-700 text-base">{description}</p>
        <div className="py-4">
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{sport}</span>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{date}</span>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">{location}</span>
        </div>
      </div>
      <div className="px-6 pt-4 pb-2">
        <a href={flyerUrl} target="_blank" rel="noopener noreferrer" className="bg-sport-blue-500 hover:bg-sport-blue-700 text-white font-bold py-2 px-4 rounded">View Flyer</a>
      </div>
    </div>
  );
};

export default EventCard;
