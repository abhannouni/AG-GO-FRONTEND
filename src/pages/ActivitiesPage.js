import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ActivityCard from '../components/ActivityCard';
import FilterBar from '../components/FilterBar';
import Spinner from '../components/Spinner';
import { fetchActivities, selectActivities, selectActivitiesLoading, selectActivitiesError } from '../redux/activities/activitiesSlice';
import { activityCategories } from '../data/mockData';

const MapLinkIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
);

const SORT_OPTIONS = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-asc', label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
];

const DEFAULT_CATEGORY = 'All';
const DEFAULT_SORT = 'popular';

const ActivitiesPage = () => {
    const [activeCategory, setActiveCategory] = useState(DEFAULT_CATEGORY);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState(DEFAULT_SORT);
    const dispatch = useDispatch();
    const activities = useSelector(selectActivities);
    const loading = useSelector(selectActivitiesLoading);
    const error = useSelector(selectActivitiesError);

    useEffect(() => {
        dispatch(fetchActivities());
    }, [dispatch]);

    const handleReset = useCallback(() => {
        setActiveCategory(DEFAULT_CATEGORY);
        setSearchQuery('');
        setSortBy(DEFAULT_SORT);
    }, []);

    const filteredActivities = useMemo(() => {
        let acts = [...activities];

        if (activeCategory !== DEFAULT_CATEGORY) {
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
            case 'rating': return acts.sort((a, b) => {
                const ra = a.rating && typeof a.rating === 'object' ? a.rating.average : a.rating ?? 0;
                const rb = b.rating && typeof b.rating === 'object' ? b.rating.average : b.rating ?? 0;
                return rb - ra;
            });
            default: return acts.sort((a, b) => (b.reviews ?? b.rating?.count ?? 0) - (a.reviews ?? a.rating?.count ?? 0));
        }
    }, [activeCategory, searchQuery, sortBy, activities]);

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
                            { value: loading ? '…' : activities.length, label: 'Activities' },
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

            {/* Filter Bar */}
            <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search activities…"
                categories={activityCategories}
                activeCategory={activeCategory}
                defaultCategory={DEFAULT_CATEGORY}
                onCategoryChange={setActiveCategory}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                defaultSort={DEFAULT_SORT}
                onSortChange={setSortBy}
                onReset={handleReset}
                actions={
                    <Link
                        to="/activities/map"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-forest-900 text-white hover:bg-forest-800 transition-colors whitespace-nowrap"
                    >
                        <MapLinkIcon />
                        Map View
                    </Link>
                }
            />

            {/* Content */}
            <div className="container mx-auto px-6 py-10">
                {/* Results count */}
                <p className="text-sm text-gray-500 mb-6">
                    <span className="font-semibold text-gray-800">{filteredActivities.length}</span>{' '}
                    {filteredActivities.length === 1 ? 'activity' : 'activities'} found
                </p>

                {loading ? (
                    <Spinner className="py-24" size="lg" />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-gray-600 font-semibold text-lg mb-2">Failed to load activities</p>
                        <p className="text-gray-400 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => dispatch(fetchActivities())}
                            className="px-6 py-2.5 rounded-full bg-forest-900 text-white text-sm font-semibold hover:bg-forest-800 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredActivities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredActivities.map((activity) => (
                            <ActivityCard key={activity._id || activity.id} activity={activity} />
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
                            onClick={handleReset}
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