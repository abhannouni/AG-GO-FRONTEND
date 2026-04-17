import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrips, selectTrips, selectTripsLoading } from '../redux/trips/tripsSlice';
import TripCard from './TripCard';
import Spinner from './Spinner';

const TripsSection = () => {
    const dispatch = useDispatch();
    const trips = useSelector(selectTrips);
    const loading = useSelector(selectTripsLoading);

    useEffect(() => {
        if (trips.length === 0) {
            dispatch(fetchTrips({ featured: true }));
        }
    }, [dispatch, trips.length]);

    const featured = trips.filter((t) => t.featured).slice(0, 4);

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

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner />
                    </div>
                ) : featured.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featured.map((trip) => (
                            <TripCard key={trip._id} trip={trip} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 border-dashed border-forest-100 bg-forest-50/30">
                        <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mb-5">
                            <svg className="w-8 h-8 text-forest-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <p className="text-gray-700 font-bold text-lg mb-1">Trips &amp; Tours Coming Soon</p>
                        <p className="text-gray-400 text-sm max-w-xs mb-6">
                            Our curated Morocco trips will be published here shortly.
                        </p>
                        <Link
                            to="/activities"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest-900 text-white text-sm font-semibold hover:bg-forest-800 transition-colors"
                        >
                            Browse Activities Instead
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                )}

                {/* View All Button */}
                <div className="text-center mt-10">
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
