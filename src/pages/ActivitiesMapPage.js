import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MapboxMap from '../components/MapboxMap';
import { fetchActivities, selectActivities, selectActivitiesLoading } from '../redux/activities/activitiesSlice';
import { activityCategories } from '../data/mockData';

const CATEGORY_COLORS = {
    Adventure: '#e5aa30',
    Cultural: '#c9911a',
    'Food & Culture': '#C1272D',
    Wellness: '#278d55',
    Beach: '#0ea5e9',
};

const BackIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const SearchIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const StarIcon = () => (
    <svg className="w-3.5 h-3.5 fill-gold-400 text-gold-400" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const ActivitiesMapPage = () => {
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [panelVisible, setPanelVisible] = useState(false);
    const [filtersExpanded, setFiltersExpanded] = useState(true);
    const dispatch = useDispatch();
    const activities = useSelector(selectActivities);
    const loading = useSelector(selectActivitiesLoading);

    useEffect(() => {
        dispatch(fetchActivities());
    }, [dispatch]);

    const filteredActivities = useMemo(() => {
        let acts = [...activities];
        if (activeCategory !== 'All') acts = acts.filter((a) => a.category === activeCategory);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            acts = acts.filter(
                (a) => {
                    const loc = a.location && typeof a.location === 'object'
                        ? a.location.address ?? ''
                        : a.location ?? '';
                    return (
                        a.title.toLowerCase().includes(q) ||
                        loc.toLowerCase().includes(q) ||
                        a.description.toLowerCase().includes(q)
                    );
                }
            );
        }
        return acts;
    }, [activeCategory, searchQuery, activities]);

    const handleSelect = (activity) => {
        setSelectedActivity(activity);
        setPanelVisible(!!activity);
    };

    const closePanel = () => {
        setSelectedActivity(null);
        setPanelVisible(false);
    };

    return (
        // Fill viewport below navbar (navbar is ~76px from Layout)
        <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 76px)' }}>

            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/70 backdrop-blur-sm">
                    <div className="flex items-center gap-3 bg-white rounded-xl shadow-lg px-5 py-3">
                        <svg className="animate-spin w-5 h-5 text-forest-700" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="text-sm font-semibold text-forest-800">Loading activities…</span>
                    </div>
                </div>
            )}

            {/* ── Map — always full size ── */}
            <MapboxMap
                activities={filteredActivities}
                selectedId={selectedActivity?._id ?? selectedActivity?.id ?? null}
                onSelect={handleSelect}
                height="100%"
                rounded={false}
            />

            {/* ── Floating top controls overlay ── */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none" style={{ right: panelVisible ? '336px' : '16px' }}>
                <div className="flex items-start gap-3">

                    {/* Back button */}
                    <Link
                        to="/activities"
                        className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg text-sm font-semibold text-forest-900 hover:bg-white transition-colors flex-shrink-0 whitespace-nowrap"
                    >
                        <BackIcon />
                        Activities
                    </Link>

                    {/* Search + filters area */}
                    <div className="pointer-events-auto flex-1 min-w-0 flex flex-col gap-2">
                        {/* Search bar */}
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <SearchIcon />
                            </span>
                            <input
                                type="text"
                                placeholder="Search activities…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-forest-900/25"
                            />
                        </div>

                        {/* Category chips (collapsible) */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFiltersExpanded((v) => !v)}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold shadow bg-white/95 backdrop-blur-sm text-gray-500 hover:bg-white transition-all"
                                title={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
                            >
                                {filtersExpanded ? '▲ Filters' : '▼ Filters'}
                            </button>

                            {filtersExpanded &&
                                activityCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shadow transition-all ${activeCategory === cat
                                            ? 'bg-forest-900 text-white shadow-forest-900/20'
                                            : 'bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-white'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Count badge */}
                    <div className="pointer-events-auto bg-white/95 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-lg text-sm font-bold text-forest-900 flex-shrink-0 whitespace-nowrap">
                        {filteredActivities.length}
                        <span className="font-normal text-gray-500 ml-1">shown</span>
                    </div>
                </div>
            </div>

            {/* ── Legend (bottom-left) ── */}
            <div className="absolute bottom-8 left-4 z-20 bg-white/92 backdrop-blur-sm rounded-2xl px-4 py-3.5 shadow-lg">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Categories</p>
                <div className="flex flex-col gap-2">
                    {Object.entries(CATEGORY_COLORS).map(([label, color]) => (
                        <button
                            key={label}
                            onClick={() => setActiveCategory(activeCategory === label ? 'All' : label)}
                            className={`flex items-center gap-2 text-xs text-left transition-all ${activeCategory === label ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <span
                                className="w-3 h-3 rounded-full flex-shrink-0 transition-transform"
                                style={{
                                    background: color,
                                    transform: activeCategory === label ? 'scale(1.3)' : 'scale(1)',
                                    boxShadow: activeCategory === label ? `0 0 0 2px white, 0 0 0 3px ${color}` : 'none',
                                }}
                            />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Cluster count info ── */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-4 py-2 rounded-full shadow pointer-events-none">
                Zoom in to see individual activities · Click clusters to expand
            </div>

            {/* ── Activity detail side panel ── */}
            <div
                className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl z-30 flex flex-col transition-transform duration-350 ease-in-out overflow-hidden ${panelVisible ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {selectedActivity ? (
                    <>
                        {/* Hero image */}
                        <div className="relative flex-shrink-0">
                            <img
                                src={selectedActivity.image}
                                alt={selectedActivity.title}
                                className="w-full h-52 object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            {/* Close */}
                            <button
                                onClick={closePanel}
                                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/45 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/65 transition-colors"
                                aria-label="Close panel"
                            >
                                <CloseIcon />
                            </button>
                            {/* Category badge */}
                            <div className="absolute bottom-3 left-3">
                                <span
                                    className="px-3 py-1 rounded-full text-white text-xs font-bold shadow"
                                    style={{ background: CATEGORY_COLORS[selectedActivity.category] || '#0a2e1c' }}
                                >
                                    {selectedActivity.category}
                                </span>
                            </div>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <h2 className="text-xl font-extrabold text-gray-900 leading-tight mb-1">
                                {selectedActivity.title}
                            </h2>

                            {/* Location */}
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                                <svg className="w-4 h-4 text-forest-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {selectedActivity.location && typeof selectedActivity.location === 'object'
                                    ? selectedActivity.location.address ?? ''
                                    : selectedActivity.location ?? ''}
                            </div>

                            {/* 3-col stat cards */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-forest-50 rounded-xl p-3 text-center">
                                    <div className="flex items-center justify-center gap-0.5 mb-0.5">
                                        <StarIcon />
                                        <span className="text-gold-500 font-extrabold text-base">
                                            {selectedActivity.rating && typeof selectedActivity.rating === 'object'
                                                ? selectedActivity.rating.average?.toFixed(1)
                                                : selectedActivity.rating}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-[10px] leading-tight">{selectedActivity.reviews} reviews</p>
                                </div>
                                <div className="bg-forest-50 rounded-xl p-3 text-center">
                                    <p className="text-forest-900 font-extrabold text-base">${selectedActivity.price}</p>
                                    <p className="text-gray-400 text-[10px] leading-tight">per person</p>
                                </div>
                                <div className="bg-forest-50 rounded-xl p-3 text-center">
                                    <svg className="w-4 h-4 text-forest-700 mx-auto mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path strokeLinecap="round" d="M12 6v6l4 2" />
                                    </svg>
                                    <p className="text-gray-400 text-[10px] leading-tight">{selectedActivity.duration}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                {selectedActivity.description}
                            </p>

                            {/* Coordinates */}
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 mb-5 text-xs text-gray-500">
                                <svg className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
                                </svg>
                                {selectedActivity.coordinates[0].toFixed(4)}°N, {Math.abs(selectedActivity.coordinates[1]).toFixed(4)}°W
                            </div>

                            {/* CTA buttons */}
                            <button className="w-full py-3 rounded-xl bg-forest-900 text-white font-bold text-sm hover:bg-forest-800 active:bg-forest-950 transition-colors mb-2">
                                Book This Activity
                            </button>
                            <button
                                onClick={closePanel}
                                className="w-full py-2.5 rounded-xl text-forest-700 font-semibold text-sm hover:bg-forest-50 transition-colors"
                            >
                                Back to Map
                            </button>
                        </div>
                    </>
                ) : null}
            </div>

            {/* Mobile: dark overlay behind panel */}
            {panelVisible && (
                <div
                    className="absolute inset-0 bg-black/25 z-20 lg:hidden"
                    onClick={closePanel}
                />
            )}
        </div>
    );
};

export default ActivitiesMapPage;
