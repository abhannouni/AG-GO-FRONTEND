import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BookingModal from './BookingModal';

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

const getCoordinates = (activity) => {
    // Check activity.location.lat/lng
    if (activity.location?.lat && activity.location?.lng) {
        return [activity.location.lat, activity.location.lng];
    }
    // Check activity.coordinates
    if (Array.isArray(activity.coordinates) && activity.coordinates.length >= 2) {
        return activity.coordinates;
    }
    return null;
};

/**
 * ActivitySidePanel - Slide-in panel showing activity details
 * 
 * Props:
 *  - activity: Activity object or null
 *  - isVisible: Boolean to control visibility
 *  - onClose: Callback when close button is clicked
 *  - showViewDetails: Whether to show "View Full Details" button (default true)
 */
const ActivitySidePanel = ({
    activity,
    isVisible,
    onClose,
    showViewDetails = true,
}) => {
    const [bookingOpen, setBookingOpen] = useState(false);
    if (!activity) return null;

    const imageUrl = (activity.images?.[0] || activity.image) || FALLBACK_IMAGE;
    const rating = activity.rating?.average ?? activity.rating ?? 0;
    const reviews = activity.rating?.count ?? activity.reviews ?? 0;
    const coords = getCoordinates(activity);

    return (
        <>
            {/* Panel */}
            <div
                className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl z-30 flex flex-col transition-transform duration-300 ease-out overflow-hidden ${isVisible ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Hero image */}
                <div className="relative flex-shrink-0">
                    <img
                        src={imageUrl}
                        alt={activity.title}
                        className="w-full h-52 object-cover"
                        onError={(e) => {
                            if (e.target.src !== FALLBACK_IMAGE) {
                                e.target.src = FALLBACK_IMAGE;
                            }
                        }}
                    />
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        aria-label="Close panel"
                    >
                        <CloseIcon />
                    </button>
                    {/* Category badge */}
                    <div className="absolute bottom-3 left-3">
                        <span
                            className="px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg"
                            style={{ background: CATEGORY_COLORS[activity.category] || '#0a2e1c' }}
                        >
                            {activity.category}
                        </span>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <h2 className="text-xl font-extrabold text-gray-900 leading-tight mb-2">
                        {activity.title}
                    </h2>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                        <svg
                            className="w-4 h-4 text-forest-600 flex-shrink-0"
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
                        {getLocationString(activity.location)}
                    </div>

                    {/* 3-col stat cards */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-forest-50 rounded-xl p-3 text-center">
                            <div className="flex items-center justify-center gap-0.5 mb-0.5">
                                <StarIcon />
                                <span className="text-gold-600 font-extrabold text-base">
                                    {rating > 0 ? rating.toFixed(1) : '—'}
                                </span>
                            </div>
                            <p className="text-gray-400 text-[10px] leading-tight">{reviews} reviews</p>
                        </div>
                        <div className="bg-forest-50 rounded-xl p-3 text-center">
                            <p className="text-forest-900 font-extrabold text-base">${activity.price}</p>
                            <p className="text-gray-400 text-[10px] leading-tight">per person</p>
                        </div>
                        <div className="bg-forest-50 rounded-xl p-3 text-center">
                            <svg
                                className="w-4 h-4 text-forest-700 mx-auto mb-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path strokeLinecap="round" d="M12 6v6l4 2" />
                            </svg>
                            <p className="text-gray-400 text-[10px] leading-tight">{formatDuration(activity.duration)}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                        {activity.description}
                    </p>

                    {/* Coordinates (if available) */}
                    {coords && (
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 mb-5 text-xs text-gray-500">
                            <svg
                                className="w-3.5 h-3.5 text-forest-600 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
                            </svg>
                            {coords[0].toFixed(4)}°, {coords[1].toFixed(4)}°
                        </div>
                    )}

                    {/* CTA buttons */}
                    {showViewDetails && (
                        <Link
                            to={`/activities/${activity._id || activity.id}`}
                            className="block w-full py-3 rounded-xl bg-forest-900 text-white font-bold text-sm text-center hover:bg-forest-800 active:bg-forest-950 transition-colors mb-2"
                        >
                            View Full Details
                        </Link>
                    )}
                    <button
                        onClick={() => setBookingOpen(true)}
                        className="w-full py-3 rounded-xl border-2 border-forest-900 text-forest-900 font-bold text-sm hover:bg-forest-50 transition-colors mb-2"
                    >
                        Book Now
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                        Back to Map
                    </button>
                </div>
            </div>

            {/* Mobile: dark overlay behind panel */}
            {isVisible && (
                <div className="absolute inset-0 bg-black/25 z-20 lg:hidden" onClick={onClose} />
            )}

            <BookingModal
                activity={activity}
                isOpen={bookingOpen}
                onClose={() => setBookingOpen(false)}
            />
        </>
    );
};

export default ActivitySidePanel;
