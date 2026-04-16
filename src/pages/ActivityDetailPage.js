import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchActivityById,
    selectSelectedActivity,
    selectActivitiesLoading,
    clearSelectedActivity,
} from '../redux/activities/activitiesSlice';
import Spinner from '../components/Spinner';
import MapboxMap from '../components/MapboxMap';

const BackIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const StarIcon = () => (
    <svg className="w-4 h-4 fill-gold-400 text-gold-400" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const CATEGORY_COLORS = {
    Adventure: '#e5aa30',
    Cultural: '#c9911a',
    'Food & Culture': '#C1272D',
    Wellness: '#278d55',
    Beach: '#0ea5e9',
    Surfing: '#00aaff',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';

const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    const num = Number(duration);
    if (isNaN(num)) return duration;
    return num === 1 ? '1 hr' : `${num} hrs`;
};

const getLocationString = (location) => {
    if (!location) return 'Location TBD';
    if (typeof location === 'string') return location;
    return location.address || location.city || 'Location TBD';
};

const ActivityDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const activity = useSelector(selectSelectedActivity);
    const loading = useSelector(selectActivitiesLoading);

    useEffect(() => {
        if (id) {
            dispatch(fetchActivityById(id));
        }
        return () => {
            dispatch(clearSelectedActivity());
        };
    }, [id, dispatch]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-4">Activity not found</p>
                <Link to="/activities" className="text-forest-700 font-semibold hover:underline">
                    ← Back to Activities
                </Link>
            </div>
        );
    }

    const imageUrl = (activity.images?.[0] || activity.image) || FALLBACK_IMAGE;
    const rating = activity.rating?.average ?? activity.rating ?? 0;
    const reviews = activity.rating?.count ?? activity.reviews ?? 0;
    const categoryColor = CATEGORY_COLORS[activity.category] || '#0a2e1c';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with back button */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-forest-900 transition-colors"
                    >
                        <BackIcon />
                        Back
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="container mx-auto px-6 py-8 max-w-6xl">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left column - Images & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Hero image */}
                        <div className="relative rounded-2xl overflow-hidden shadow-lg">
                            <img
                                src={imageUrl}
                                alt={activity.title}
                                className="w-full h-96 object-cover"
                                onError={(e) => {
                                    if (e.target.src !== FALLBACK_IMAGE) {
                                        e.target.src = FALLBACK_IMAGE;
                                    }
                                }}
                            />
                            {/* Category badge */}
                            <div className="absolute top-4 left-4">
                                <span
                                    className="px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg"
                                    style={{ background: categoryColor }}
                                >
                                    {activity.category}
                                </span>
                            </div>
                        </div>

                        {/* Additional images */}
                        {activity.images && activity.images.length > 1 && (
                            <div className="grid grid-cols-3 gap-4">
                                {activity.images.slice(1, 4).map((img, idx) => (
                                    <div key={idx} className="rounded-xl overflow-hidden shadow">
                                        <img
                                            src={img}
                                            alt={`${activity.title} ${idx + 2}`}
                                            className="w-full h-32 object-cover"
                                            onError={(e) => {
                                                if (e.target.src !== FALLBACK_IMAGE) {
                                                    e.target.src = FALLBACK_IMAGE;
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Title & Location */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
                                {activity.title}
                            </h1>
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                                <svg
                                    className="w-5 h-5 text-forest-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-medium">{getLocationString(activity.location)}</span>
                            </div>

                            {/* Stats row */}
                            <div className="flex items-center gap-6 pb-5 border-b border-gray-100">
                                <div className="flex items-center gap-1.5">
                                    <StarIcon />
                                    <span className="font-bold text-gray-900">
                                        {rating > 0 ? rating.toFixed(1) : '—'}
                                    </span>
                                    <span className="text-sm text-gray-500">({reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path strokeLinecap="round" d="M12 6v6l4 2" />
                                    </svg>
                                    <span className="font-medium">{formatDuration(activity.duration)}</span>
                                </div>
                                {activity.maxParticipants && (
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="font-medium">Max {activity.maxParticipants} people</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="pt-5">
                                <h2 className="text-lg font-bold text-gray-900 mb-3">About This Activity</h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {activity.description}
                                </p>
                            </div>
                        </div>

                        {/* What's Included / Not Included */}
                        {(activity.included?.length > 0 || activity.excluded?.length > 0) && (
                            <div className="bg-white rounded-2xl shadow p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {activity.included?.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                                                ✓ What's Included
                                            </h3>
                                            <ul className="space-y-2">
                                                {activity.included.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <span className="text-green-600 mt-0.5">✓</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {activity.excluded?.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                                                ✕ What's Not Included
                                            </h3>
                                            <ul className="space-y-2">
                                                {activity.excluded.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <span className="text-red-600 mt-0.5">✕</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Embedded Map */}
                        {(activity.location?.lat || activity.coordinates) && (
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Location</h2>
                                <div className="rounded-xl overflow-hidden">
                                    <MapboxMap
                                        activities={[activity]}
                                        selectedId={activity._id || activity.id}
                                        onSelect={null}
                                        height="320px"
                                        rounded={false}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column - Booking card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                            <div className="flex items-baseline gap-2 mb-5">
                                <span className="text-3xl font-extrabold text-forest-900">${activity.price}</span>
                                <span className="text-gray-500 text-sm">per person</span>
                            </div>

                            <button className="w-full py-3.5 rounded-xl bg-forest-900 text-white font-bold hover:bg-forest-800 active:bg-forest-950 transition-colors mb-3">
                                Book Now
                            </button>

                            <Link
                                to="/activities/map"
                                className="block w-full py-3 rounded-xl border-2 border-forest-900 text-forest-900 font-bold text-center hover:bg-forest-50 transition-colors"
                            >
                                View on Map
                            </Link>

                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Instant confirmation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Free cancellation up to 24h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityDetailPage;
