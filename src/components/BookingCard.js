import React from 'react';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        dot: 'bg-yellow-400',
    },
    confirmed: {
        label: 'Confirmed',
        bg: 'bg-green-100',
        text: 'text-green-800',
        dot: 'bg-green-500',
    },
    cancelled: {
        label: 'Cancelled',
        bg: 'bg-red-100',
        text: 'text-red-700',
        dot: 'bg-red-500',
    },
    completed: {
        label: 'Completed',
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        dot: 'bg-blue-500',
    },
};

const PAYMENT_CONFIG = {
    pending: { label: 'Unpaid', color: 'text-yellow-600' },
    paid: { label: 'Paid', color: 'text-green-600' },
    refunded: { label: 'Refunded', color: 'text-blue-600' },
    failed: { label: 'Failed', color: 'text-red-600' },
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&q=80';

/**
 * BookingCard
 *
 * Props:
 *   booking       – booking object (activityId may be populated or just an id string)
 *   onCancel      – (bookingId) => void
 *   cancelLoading – string | null  (id of the booking currently being cancelled)
 */
const BookingCard = ({ booking, onCancel, cancelLoading }) => {
    const activity = booking.activityId && typeof booking.activityId === 'object'
        ? booking.activityId
        : {};

    const activityId = typeof booking.activityId === 'string'
        ? booking.activityId
        : activity._id;

    const imageUrl = activity.images?.[0] || activity.image || FALLBACK_IMAGE;
    const title = activity.title || 'Activity';
    const location = activity.location?.address || activity.location?.city || '';

    const status = booking.status || 'pending';
    const paymentStatus = booking.paymentStatus || 'pending';
    const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const paymentCfg = PAYMENT_CONFIG[paymentStatus] || PAYMENT_CONFIG.pending;

    const bookingDate = booking.date
        ? new Date(booking.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })
        : '—';

    const canCancel = status === 'pending' || status === 'confirmed';
    const isCancelling = cancelLoading === booking._id;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
                {/* Thumbnail */}
                <div className="relative sm:w-44 h-40 sm:h-auto flex-shrink-0">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            if (e.target.src !== FALLBACK_IMAGE) e.target.src = FALLBACK_IMAGE;
                        }}
                    />
                    {/* Status badge */}
                    <div className="absolute top-2 left-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dot}`} />
                            {statusCfg.label}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="font-extrabold text-gray-900 text-base leading-snug truncate">{title}</h3>
                            {location ? (
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                        <circle cx="12" cy="9" r="2.5" />
                                    </svg>
                                    {location}
                                </p>
                            ) : null}
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                            <div className="text-xl font-extrabold text-forest-900">
                                ${booking.totalPrice ?? 0}
                            </div>
                            <div className={`text-xs font-semibold ${paymentCfg.color}`}>
                                {paymentCfg.label}
                            </div>
                        </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                            </svg>
                            {bookingDate}{booking.time ? ` · ${booking.time}` : ''}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                            </svg>
                            {booking.participants} participant{booking.participants !== 1 ? 's' : ''}
                        </span>
                        {booking._id && (
                            <span className="text-gray-300 font-mono">
                                #{booking._id.slice(-6).toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-4">
                        {activityId && (
                            <Link
                                to={`/activities/${activityId}`}
                                className="text-xs font-semibold text-forest-700 hover:text-forest-900 hover:underline transition-colors"
                            >
                                View activity →
                            </Link>
                        )}
                        {canCancel && (
                            <button
                                onClick={() => onCancel(booking._id)}
                                disabled={isCancelling}
                                className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isCancelling ? 'Cancelling…' : 'Cancel booking'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingCard;
