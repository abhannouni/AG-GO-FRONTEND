import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MapboxMap from '../components/MapboxMap';
import ActivitySidePanel from '../components/ActivitySidePanel';
import { fetchActivities, selectActivities, selectActivitiesLoading } from '../redux/activities/activitiesSlice';
import { activityCategories } from '../constants/uiConstants';

const CATEGORY_COLORS = {
    Adventure: '#e5aa30',
    Cultural: '#c9911a',
    'Food & Culture': '#C1272D',
    Wellness: '#278d55',
    Beach: '#0ea5e9',
    Surfing: '#00aaff',
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
            <ActivitySidePanel
                activity={selectedActivity}
                isVisible={panelVisible}
                onClose={closePanel}
                showViewDetails={true}
            />
        </div>
    );
};

export default ActivitiesMapPage;
