import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchMyBookings,
    cancelBooking,
    selectMyBookings,
    selectBookingsLoading,
    selectCancelBookingLoading,
    selectBookingsError,
} from '../redux/bookings/bookingsSlice';
import { showToast } from '../redux/ui/uiSlice';
import BookingCard from '../components/BookingCard';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const EmptyBookings = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-forest-50 flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-forest-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">No bookings yet</h3>
        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
            Explore activities and book your next adventure!
        </p>
    </div>
);

const MyBookingsPage = () => {
    const dispatch = useDispatch();
    const bookings = useSelector(selectMyBookings);
    const loading = useSelector(selectBookingsLoading);
    const cancelLoading = useSelector(selectCancelBookingLoading);
    const error = useSelector(selectBookingsError);

    const [activeFilter, setActiveFilter] = useState('all');
    const [confirmId, setConfirmId] = useState(null); // booking id pending cancel confirmation

    useEffect(() => {
        dispatch(fetchMyBookings());
    }, [dispatch]);

    // Toast on error
    useEffect(() => {
        if (error) {
            dispatch(showToast({ message: error, type: 'error' }));
        }
    }, [error, dispatch]);

    const handleCancelRequest = (id) => setConfirmId(id);

    const handleCancelConfirm = async () => {
        if (!confirmId) return;
        const id = confirmId;
        setConfirmId(null);
        const result = await dispatch(cancelBooking(id));
        if (cancelBooking.fulfilled.match(result)) {
            dispatch(showToast({ message: 'Booking cancelled successfully.', type: 'success' }));
        } else {
            dispatch(showToast({ message: result.payload || 'Could not cancel booking.', type: 'error' }));
        }
    };

    const filtered = activeFilter === 'all'
        ? bookings
        : bookings.filter((b) => b.status === activeFilter);

    const counts = FILTERS.reduce((acc, f) => {
        acc[f] = f === 'all' ? bookings.length : bookings.filter((b) => b.status === f).length;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">My Bookings</h1>
                    <p className="text-gray-500 mt-1">
                        {bookings.length > 0
                            ? `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} total`
                            : 'Manage your activity bookings'}
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-24">
                        <Spinner />
                    </div>
                )}

                {/* Content */}
                {!loading && (
                    <>
                        {/* Filter tabs */}
                        {bookings.length > 0 && (
                            <div className="flex gap-2 flex-wrap mb-6">
                                {FILTERS.map((f) => (
                                    counts[f] > 0 || f === 'all' ? (
                                        <button
                                            key={f}
                                            onClick={() => setActiveFilter(f)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${activeFilter === f
                                                    ? 'bg-forest-900 text-white shadow-sm'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-forest-300 hover:text-forest-800'
                                                }`}
                                        >
                                            {f === 'all' ? 'All' : f}
                                            {counts[f] > 0 && (
                                                <span className={`ml-1.5 text-xs ${activeFilter === f ? 'opacity-70' : 'text-gray-400'}`}>
                                                    {counts[f]}
                                                </span>
                                            )}
                                        </button>
                                    ) : null
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {bookings.length === 0 && <EmptyBookings />}

                        {/* Filtered empty */}
                        {bookings.length > 0 && filtered.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                No {activeFilter} bookings found.
                            </div>
                        )}

                        {/* Booking list */}
                        <div className="space-y-4">
                            {filtered.map((booking) => (
                                <BookingCard
                                    key={booking._id}
                                    booking={booking}
                                    onCancel={handleCancelRequest}
                                    cancelLoading={cancelLoading}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Cancel confirmation dialog */}
            <ConfirmModal
                isOpen={!!confirmId}
                title="Cancel booking?"
                message="This will cancel your booking. Free cancellations are available up to 24 hours before the activity. Are you sure?"
                confirmLabel="Yes, cancel"
                cancelLabel="Keep booking"
                danger={true}
                onConfirm={handleCancelConfirm}
                onCancel={() => setConfirmId(null)}
            />
        </div>
    );
};

export default MyBookingsPage;
