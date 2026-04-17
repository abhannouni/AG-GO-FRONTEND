import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TripCard from '../components/TripCard';
import FilterBar from '../components/FilterBar';
import Spinner from '../components/Spinner';
import { fetchTrips, selectTrips, selectTripsLoading, selectTripsError } from '../redux/trips/tripsSlice';

const TRIP_CATEGORIES = ['All', 'City Tour', 'Adventure', 'Cultural', 'Beach'];

const REGIONS = [
    'All Regions',
    'Marrakech-Safi',
    'Drâa-Tafilalet',
    'Tanger-Tétouan',
    'Fès-Meknès',
];

const SORT_OPTIONS = [
    { value: 'featured', label: 'Featured First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-asc', label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
];

const DEFAULT_CATEGORY = 'All';
const DEFAULT_REGION = 'All Regions';
const DEFAULT_SORT = 'featured';

const TripsPage = () => {
    const dispatch = useDispatch();
    const trips = useSelector(selectTrips);
    const loading = useSelector(selectTripsLoading);
    const error = useSelector(selectTripsError);

    const [activeCategory, setActiveCategory] = useState(DEFAULT_CATEGORY);
    const [activeRegion, setActiveRegion] = useState(DEFAULT_REGION);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState(DEFAULT_SORT);

    useEffect(() => {
        dispatch(fetchTrips());
    }, [dispatch]);

    const handleReset = useCallback(() => {
        setActiveCategory(DEFAULT_CATEGORY);
        setActiveRegion(DEFAULT_REGION);
        setSearchQuery('');
        setSortBy(DEFAULT_SORT);
    }, []);

    const filteredTrips = useMemo(() => {
        let list = [...trips];

        if (activeCategory !== DEFAULT_CATEGORY) {
            list = list.filter((t) => t.category === activeCategory);
        }
        if (activeRegion !== DEFAULT_REGION) {
            list = list.filter((t) => t.region === activeRegion);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter((t) => {
                const loc = t.location && typeof t.location === 'object'
                    ? t.location.address ?? ''
                    : t.location ?? '';
                return (
                    (t.title || '').toLowerCase().includes(q) ||
                    loc.toLowerCase().includes(q) ||
                    (t.description || '').toLowerCase().includes(q)
                );
            });
        }

        switch (sortBy) {
            case 'price-asc': return list.sort((a, b) => a.price - b.price);
            case 'price-desc': return list.sort((a, b) => b.price - a.price);
            case 'rating': return list.sort((a, b) => {
                const ra = a.rating?.average ?? 0;
                const rb = b.rating?.average ?? 0;
                return rb - ra;
            });
            default: return list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }
    }, [trips, activeCategory, activeRegion, searchQuery, sortBy]);

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

                    <div className="flex flex-wrap gap-6 mt-8">
                        {[
                            { value: '6+', label: 'Regions Covered' },
                            { value: '4.7★', label: 'Avg. Rating' },
                            { value: '10+', label: 'Years Experience' },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-2">
                                <span className="text-gold-400 font-extrabold text-xl">{s.value}</span>
                                <span className="text-white/60 text-sm">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search trips…"
                categories={TRIP_CATEGORIES}
                activeCategory={activeCategory}
                defaultCategory={DEFAULT_CATEGORY}
                onCategoryChange={setActiveCategory}
                selects={[{
                    id: 'region',
                    label: 'Region',
                    value: activeRegion,
                    defaultValue: DEFAULT_REGION,
                    onChange: setActiveRegion,
                    options: REGIONS.map((r) => ({ value: r, label: r })),
                }]}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                defaultSort={DEFAULT_SORT}
                onSortChange={setSortBy}
                onReset={handleReset}
            />

            {/* Results */}
            <div className="container mx-auto px-6 py-10">
                {loading ? (
                    <div className="flex justify-center py-24">
                        <Spinner />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-red-600 font-semibold mb-2">Failed to load trips</p>
                        <p className="text-gray-400 text-sm">{error}</p>
                        <button
                            onClick={() => dispatch(fetchTrips())}
                            className="mt-4 px-6 py-2.5 rounded-full bg-forest-900 text-white text-sm font-semibold hover:bg-forest-800 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-500 mb-6">
                            <span className="font-semibold text-gray-800">{filteredTrips.length}</span>{' '}
                            {filteredTrips.length === 1 ? 'trip' : 'trips'} found
                        </p>

                        {filteredTrips.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredTrips.map((trip) => (
                                    <TripCard key={trip._id} trip={trip} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 bg-forest-50 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10 text-forest-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                                <p className="text-gray-700 font-bold text-xl mb-2">No trips found</p>
                                <p className="text-gray-400 text-sm max-w-sm">
                                    Try adjusting your filters or search query.
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="mt-6 px-6 py-2.5 rounded-full bg-forest-900 text-white text-sm font-semibold hover:bg-forest-800 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TripsPage;
