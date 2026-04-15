import React from 'react';
import { Link } from 'react-router-dom';
import TripCard from './TripCard';
import { mockTrips } from '../data/mockData';

const TripsSection = () => {
    const displayedTrips = mockTrips.slice(0, 4);

    return (
        <section id="trips" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <span className="inline-block text-gold-500 text-sm font-bold uppercase tracking-widest mb-3">
                            ❆ Featured Trips
                        </span>
                        <h2 className="text-gray-900 font-extrabold text-4xl md:text-5xl leading-tight">
                            Popular Morocco
                            <br />
                            <span className="text-forest-900">Destinations</span>
                        </h2>
                    </div>
                    <p className="text-gray-500 max-w-sm md:text-right text-sm leading-relaxed">
                        Handpicked experiences from the most breathtaking corners of Morocco —
                        from ancient medinas to vast golden deserts.
                    </p>
                </div>

                {/* Trip Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayedTrips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Link
                        to="/trips"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-forest-900 text-forest-900 font-semibold hover:bg-forest-900 hover:text-white transition-all duration-200 group"
                    >
                        Explore All Trips
                        <svg
                            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default TripsSection;
