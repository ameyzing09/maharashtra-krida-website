import React from 'react';
import { EventProps } from '../types';

const EventCard: React.FC<EventProps> = ({ name, sport, date, location, imageUrl, flyerUrl, description }) => {
    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
            <img className="w-full h-48 object-cover" src={imageUrl} alt={`Flyer for ${name}`} />
            <div className="px-6 py-4 flex flex-col justify-between" style={{ minHeight: '260px' }}>
                <div>
                    <div className="font-bold text-xl mb-2">{name}</div>
                    <p className="text-gray-700 text-base overflow-ellipsis overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical' }}>
                        {description}
                    </p>
                </div>
                <div>
                    <div className="py-4">
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{sport}</span>
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{date}</span>
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">{location}</span>
                    </div>
                    <a href={flyerUrl} target="_blank" rel="noopener noreferrer" className="bg-lime-400 hover:bg-lime-500 text-white font-bold py-2 px-4 rounded inline-block mt-2">View Flyer</a>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
