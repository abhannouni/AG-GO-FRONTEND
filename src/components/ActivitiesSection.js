import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ToggleView from './ToggleView';
import { fetchActivities, selectActivities, selectActivitiesLoading } from '../redux/activities/activitiesSlice';
import { activityCategories } from '../constants/uiConstants';

const ActivitiesSection = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const dispatch = useDispatch();
    const activities = useSelector(selectActivities);
    const loading = useSelector(selectActivitiesLoading);

    useEffect(() => {
        dispatch(fetchActivities());
    }, [dispatch]);

    const filteredActivities =
        activeCategory === 'All'
            ? activities
            : activities.filter((a) => a.category === activeCategory);

    return (
        <section id="activities" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <span className="inline-block text-gold-500 text-sm font-bold uppercase tracking-widest mb-3">
                            ❆ Things To Do
                        </span>
                        <h2 className="text-gray-900 font-extrabold text-4xl md:text-5xl leading-tight">
                            Explore
                            <br />
                            <span className="text-forest-900">Activities</span>
                        </h2>
                    </div>
                    <p className="text-gray-500 max-w-sm text-sm leading-relaxed md:text-right">
                        From thrilling desert adventures to authentic cultural experiences —
                        there's something extraordinary for every traveler.
                    </p>
                </div>

                {/* Category Filter + Toggle Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {activityCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeCategory === cat
                                    ? 'bg-forest-900 text-white shadow-md shadow-forest-900/20'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Results count */}
                    <span className="text-sm text-gray-400 flex-shrink-0">
                        {loading ? '…' : `${filteredActivities.length} activities found`}
                    </span>
                </div>

                {/* Toggle View (List / Map) */}
                <ToggleView activities={filteredActivities.slice(0, 8)} />

                {/* View All Activities Link */}
                <div className="text-center mt-10">
                    <Link
                        to="/activities"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-forest-900 text-forest-900 font-semibold hover:bg-forest-900 hover:text-white transition-all duration-200 group"
                    >
                        Explore All Activities
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ActivitiesSection;
