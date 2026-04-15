import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ActivityCard from '../components/ActivityCard';
import { mockActivities, activityCategories } from '../data/mockData';

const SearchIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
);

const MapLinkIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
);

const ActivitiesPage = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('popular');

    const filteredActivities = useMemo(() => {
        let acts = [...mockActivities];

        if (activeCategory !== 'All') {
            acts = acts.filter((a) => a.category === activeCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            acts = acts.filter(
                (a) =>
                    a.title.toLowerCase().includes(q) ||
                    a.location.toLowerCase().includes(q) ||
                    a.description.toLowerCase().includes(q)
            );
        }

        switch (sortBy) {
            case 'price-asc': return acts.sort((a, b) => a.price - b.price);
            case 'price-desc': return acts.sort((a, b) => b.price - a.price);
            case 'rating': return acts.sort((a, b) => b.rating - a.rating);
            default: return acts.sort((a, b) => b.reviews - a.reviews);
        }
    }, [activeCategory, searchQuery, sortBy]);

    return (
        <div className="min-h-screen bg-white">
            {/* Page Hero */}
            <div className="relative bg-forest-900 pt-32 pb-16 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-15"
                    style={{ backgroundImage: `url(https://images.unsplash.com/photo-1519055548599-6d4d129508c4?w=1600&q=80)` }}
                />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="container mx-auto px-6 relative">
                    <p className="text-gold-400 font-semibold text-sm uppercase tracking-widest mb-3">
                        ✦ Things To Do
                    </p>
                    <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
                        Explore Activities
                    </h1>
                    <p className="text-white/70 text-lg max-w-xl">
                        Discover incredible experiences across Morocco — from desert treks to cultural tours.
                    </p>

                    {/* Stats + Map link */}
                    <div className="flex flex-wrap items-center gap-6 mt-8">
                        {[
                            { value: mockActivities.length, label: 'Activities' },
                            { value: '5', label: 'Categories' },
                            { value: '4.7★', label: 'Avg. Rating' },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-2">
                                <span className="text-gold-400 font-extrabold text-xl">{s.value}</span>
                                <span className="text-white/60 text-sm">{s.label}</span>
                            </div>
                        ))}
                        <Link
                            to="/activities/map"
                            className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500 text-forest-950 text-sm font-bold hover:bg-gold-400 transition-colors shadow-lg"
                        >
                            <MapLinkIcon />
                            Open Map View
                        </Link>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="sticky top-[76px] z-40 bg-white border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">

                        {/* Left: Search + Category chips */}
                        <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
                            <div className="relative sm:w-64">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <SearchIcon />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search activities..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-700"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {activityCategories.map((cat) => (
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
                        </div>

                        {/* Right: Sort + Map link */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="text-xs font-medium text-gray-700 border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest-900/20 bg-white"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="rating">Highest Rated</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>

                            <Link
                                to="/activities/map"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-forest-900 text-white hover:bg-forest-800 transition-colors"
                            >
                                <MapLinkIcon />
                                Map View
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-10">
                {/* Results count */}
                <p className="text-sm text-gray-500 mb-6">
                    Showing <span className="font-bold text-forest-900">{filteredActivities.length}</span>{' '}
                    {filteredActivities.length === 1 ? 'activity' : 'activities'}
                    {activeCategory !== 'All' && ` in "${activeCategory}"`}
                </p>

                {filteredActivities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredActivities.map((activity) => (
                            <ActivityCard key={activity.id} activity={activity} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-forest-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-forest-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-semibold text-lg mb-2">No activities found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your filters or search query.</p>
                        <button
                            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
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

export default ActivitiesPage;