import React from 'react';
import { Link } from 'react-router-dom';
import ActivityCard from './ActivityCard';

const ListIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
);

const MapIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
);

const ToggleView = ({ activities }) => {
    return (
        <div>
            {/* Toggle Controls */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 w-fit">
                <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-forest-900 shadow-md"
                >
                    <ListIcon />
                    List View
                </button>
                <Link
                    to="/activities/map"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-white transition-all duration-200"
                >
                    <MapIcon />
                    Map View
                </Link>
            </div>

            {/* Activity grid — always list view; Map View navigates to /activities/map */}
            <div className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {activities.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ToggleView;
