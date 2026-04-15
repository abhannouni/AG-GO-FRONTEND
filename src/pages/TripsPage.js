import React, { useState, useMemo } from 'react';
import TripCard from '../components/TripCard';
import { mockTrips } from '../data/mockData';

const tripCategories = ['All', 'City Tour', 'Adventure', 'Cultural', 'Beach'];

const regions = [
    'All Regions',
    'Marrakech-Safi',
    'Drâa-Tafilalet',
    'Tanger-Tétouan',
    'Fès-Meknès',
];

const SearchIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
);

const FilterIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V20l-4-4v-5.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

const TripsPage = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeRegion, setActiveRegion] = useState('All Regions');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('featured');

    const filteredTrips = useMemo(() => {
        let trips = [...mockTrips];

        if (activeCategory !== 'All') {
            trips = trips.filter((t) => t.category === activeCategory);
        }
        if (activeRegion !== 'All Regions') {
            trips = trips.filter((t) => t.region === activeRegion);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            trips = trips.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    t.location.toLowerCase().includes(q) ||
                    t.description.toLowerCase().includes(q)
            );
        }

        switch (sortBy) {
            case 'price-asc': return trips.sort((a, b) => a.price - b.price);
            case 'price-desc': return trips.sort((a, b) => b.price - a.price);
            case 'rating': return trips.sort((a, b) => {
                const ra = a.rating && typeof a.rating === 'object' ? a.rating.average : a.rating ?? 0;
                const rb = b.rating && typeof b.rating === 'object' ? b.rating.average : b.rating ?? 0;
                return rb - ra;
            });
            default: return trips.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }
    }, [activeCategory, activeRegion, searchQuery, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Hero */}
            <div className="relative bg-forest-900 pt-32 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(https://images.unsplash.com/photo-1548813395-dabb7a4e5d2a?w=1600&q=80)` }}
                />
                <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="container mx-auto px-6 relative">
                    <p className="text-gold-400 font-semibold text-sm uppercase tracking-widest mb-3">
                        ✦ Discover Morocco
                    </p>
                    <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
                        All Trips &amp; Tours
                    </h1>
                    <p className="text-white/70 text-lg max-w-xl">
                        From desert adventures to coastal escapes — find the perfect Moroccan journey.
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-6 mt-8">
                        {[
                            { value: mockTrips.length, label: 'Trips Available' },
                            { value: '6+', label: 'Regions Covered' },
                            { value: '4.7★', label: 'Avg. Rating' },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-2">
                                <span className="text-gold-400 font-extrabold text-xl">{s.value}</span>
                                <span className="text-white/60 text-sm">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="sticky top-[76px] z-40 bg-white border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full lg:w-72">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                <SearchIcon />
                            </span>
                            <input
                                type="text"
                                placeholder="Search trips..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-700"
                            />
                        </div>

                        {/* Category chips */}
                        <div className="flex flex-wrap gap-2">
                            {tripCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === cat
                                        ? 'bg-forest-900 text-white shadow-md shadow-forest-900/20'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Region + Sort */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                <FilterIcon />
                            </div>
                            <select
                                value={activeRegion}
                                onChange={(e) => setActiveRegion(e.target.value)}
                                className="text-xs font-medium text-gray-700 border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest-900/20 bg-white"
                            >
                                {regions.map((r) => <option key={r}>{r}</option>)}
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="text-xs font-medium text-gray-700 border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest-900/20 bg-white"
                            >
                                <option value="featured">Featured First</option>
                                <option value="rating">Highest Rated</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="container mx-auto px-6 py-10">
                {/* Results count */}
                <p className="text-sm text-gray-500 mb-6">
                    Showing <span className="font-bold text-forest-900">{filteredTrips.length}</span>{' '}
                    {filteredTrips.length === 1 ? 'trip' : 'trips'}
                    {activeCategory !== 'All' && ` in "${activeCategory}"`}
                    {searchQuery && ` matching "${searchQuery}"`}
                </p>

                {filteredTrips.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTrips.map((trip) => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-forest-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-forest-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-semibold text-lg mb-2">No trips found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your filters or search query.</p>
                        <button
                            onClick={() => { setActiveCategory('All'); setActiveRegion('All Regions'); setSearchQuery(''); }}
                            className="mt-4 px-6 py-2.5 rounded-full bg-forest-900 text-white text-sm font-semibold hover:bg-forest-800 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripsPage;
