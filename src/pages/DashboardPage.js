import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchProviderActivities, createActivity, updateActivity, deleteActivity,
    selectProviderActivities, selectProviderActivitiesLoading, selectProviderActivitiesError,
} from '../redux/activities/activitiesSlice';
import {
    fetchMyBookings, fetchProviderBookings, updateBookingStatus,
    selectMyBookings, selectProviderBookings, selectBookingsLoading, selectBookingsError,
} from '../redux/bookings/bookingsSlice';
import { selectIsAuthenticated, selectUser, selectUserRole } from '../redux/auth/authSlice';
import { showToast } from '../redux/ui/uiSlice';
import Spinner from '../components/Spinner';
import ActivityForm from '../components/ActivityForm';
import ConfirmModal from '../components/ConfirmModal';
import AvailabilityManager from '../components/AvailabilityManager';

const STATUS_BADGE = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
};

const CATEGORY_COLORS = {
    Adventure: 'bg-orange-100 text-orange-700',
    Cultural: 'bg-amber-100 text-amber-700',
    'Food & Culture': 'bg-red-50 text-red-700',
    Wellness: 'bg-forest-100 text-forest-700',
    Beach: 'bg-sky-100 text-sky-700',
};

const DashboardPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const role = useSelector(selectUserRole);

    const activities = useSelector(selectProviderActivities);
    const activitiesLoading = useSelector(selectProviderActivitiesLoading);
    const activitiesError = useSelector(selectProviderActivitiesError);

    const myBookings = useSelector(selectMyBookings);
    const providerBookings = useSelector(selectProviderBookings);
    const bookingsLoading = useSelector(selectBookingsLoading);
    const bookingsError = useSelector(selectBookingsError);

    const [tab, setTab] = useState(role === 'client' ? 'bookings' : 'activities'); const [showForm, setShowForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, title: '' });
    const [deletingId, setDeletingId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (role === 'client') {
            dispatch(fetchMyBookings());
        } else {
            dispatch(fetchProviderActivities(user?._id || user?.id));
            dispatch(fetchProviderBookings());
        }
    }, [dispatch, isAuthenticated, role, navigate]);

    const openCreate = () => {
        setEditingActivity(null);
        setShowForm(true);
    };

    const openEdit = (activity) => {
        setEditingActivity(activity);
        setShowForm(true);
    };

    const handleFormSubmit = async (payload) => {
        setFormLoading(true);
        try {
            if (editingActivity) {
                await dispatch(updateActivity({ id: editingActivity._id || editingActivity.id, data: payload })).unwrap();
                dispatch(showToast({ message: 'Activity updated!', type: 'success' }));
            } else {
                await dispatch(createActivity(payload)).unwrap();
                dispatch(showToast({ message: 'Activity created!', type: 'success' }));
            }
            setShowForm(false);
        } catch (err) {
            dispatch(showToast({ message: err || 'Something went wrong', type: 'error' }));
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteRequest = (id, title) =>
        setConfirmDelete({ open: true, id, title });

    const handleDeleteConfirm = async () => {
        const { id } = confirmDelete;
        setDeletingId(id);
        try {
            await dispatch(deleteActivity(id)).unwrap();
            dispatch(showToast({ message: 'Activity deleted', type: 'success' }));
            setConfirmDelete({ open: false, id: null, title: '' });
        } catch (err) {
            dispatch(showToast({ message: err || 'Delete failed', type: 'error' }));
        } finally {
            setDeletingId(null);
        }
    };

    const handleStatusUpdate = async (bookingId, status) => {
        try {
            await dispatch(updateBookingStatus({ id: bookingId, data: { status } })).unwrap();
            dispatch(showToast({ message: `Booking ${status}`, type: 'success' }));
            dispatch(fetchProviderBookings());
        } catch (err) {
            dispatch(showToast({ message: err || 'Update failed', type: 'error' }));
        }
    };

    const isProvider = role === 'prestataire' || role === 'admin';
    const bookings = isProvider ? providerBookings : myBookings;

    return (
        <div className="min-h-screen bg-gray-50 pt-28">
            <div className="container mx-auto px-6 max-w-6xl pb-16">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-forest-950">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Welcome back, <span className="font-semibold text-forest-800">{user?.name || user?.email}</span>
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-forest-100 text-forest-700 text-xs font-semibold capitalize">{role}</span>
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit mb-8">
                    {isProvider && (
                        <button
                            onClick={() => setTab('activities')}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'activities' ? 'bg-forest-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            My Activities
                        </button>
                    )}
                    {isProvider && (
                        <button
                            onClick={() => setTab('availability')}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'availability' ? 'bg-forest-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Availability
                        </button>
                    )}
                    <button
                        onClick={() => setTab('bookings')}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'bookings' ? 'bg-forest-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {isProvider ? 'Incoming Bookings' : 'My Bookings'}
                    </button>
                </div>

                {/* ── Activities Tab (provider/admin) ── */}
                {tab === 'activities' && isProvider && (
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-forest-950">Activities</h2>
                            <button
                                onClick={openCreate}
                                className="bg-forest-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-forest-800 transition-colors shadow-md shadow-forest-900/20"
                            >
                                + Add Activity
                            </button>
                        </div>

                        {activitiesError && (
                            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{activitiesError}</div>
                        )}

                        {activitiesLoading ? (
                            <Spinner className="py-20" />
                        ) : activities.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                                <p className="text-gray-500 font-medium mb-2">No activities yet</p>
                                <p className="text-gray-400 text-sm mb-4">Create your first activity to start receiving bookings.</p>
                                <button onClick={openCreate} className="px-6 py-2.5 rounded-full bg-forest-900 text-white text-sm font-semibold hover:bg-forest-800 transition-colors">
                                    Create Activity
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activities.map((act) => {
                                    const thumb = act.images?.[0] || act.image;
                                    const catCls = CATEGORY_COLORS[act.category] || 'bg-gray-100 text-gray-700';
                                    const actId = act._id || act.id;
                                    const isDeleting = deletingId === actId;
                                    return (
                                        <div
                                            key={actId}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                                        >
                                            {/* Thumbnail */}
                                            {thumb ? (
                                                <div className="h-36 overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <img
                                                        src={thumb}
                                                        alt={act.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-36 bg-gradient-to-br from-forest-50 to-forest-100 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-10 h-10 text-forest-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
                                                    </svg>
                                                </div>
                                            )}

                                            <div className="p-5 flex flex-col gap-3 flex-1">
                                                {/* Category + title */}
                                                <div>
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catCls}`}>
                                                        {act.category}
                                                    </span>
                                                    <h3 className="font-bold text-forest-950 mt-2.5 text-base leading-snug line-clamp-1">
                                                        {act.title}
                                                    </h3>
                                                    {act.description && (
                                                        <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                                                            {act.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Meta row */}
                                                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                                    {act.city && (
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3 h-3 text-forest-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            {act.city}
                                                        </span>
                                                    )}
                                                    {act.duration != null && (
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <circle cx="12" cy="12" r="10" />
                                                                <path strokeLinecap="round" d="M12 6v6l4 2" />
                                                            </svg>
                                                            {typeof act.duration === 'number' ? `${act.duration}h` : act.duration}
                                                        </span>
                                                    )}
                                                    {(act.capacity || act.maxParticipants) && (
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" />
                                                            </svg>
                                                            Cap {(act.capacity || act.maxParticipants)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Footer row */}
                                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                                                    <span className="font-bold text-forest-900 text-sm">
                                                        {act.price} MAD
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openEdit(act)}
                                                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRequest(actId, act.title)}
                                                            disabled={isDeleting}
                                                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-60 flex items-center gap-1"
                                                        >
                                                            {isDeleting ? (
                                                                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                                </svg>
                                                            ) : 'Delete'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Availability Tab (provider/admin) ── */}
                {tab === 'availability' && isProvider && (
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-forest-950">Manage Availability</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Define the dates and time slots when clients can book your activities.</p>
                            </div>
                        </div>
                        <AvailabilityManager activities={activities} />
                    </div>
                )}

                {/* ── Bookings Tab ── */}
                {tab === 'bookings' && (
                    <div>
                        <h2 className="text-xl font-bold text-forest-950 mb-5">
                            {isProvider ? 'Incoming Bookings' : 'My Bookings'}
                        </h2>

                        {bookingsError && (
                            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{bookingsError}</div>
                        )}

                        {bookingsLoading ? (
                            <Spinner className="py-20" />
                        ) : bookings.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                                <p className="text-gray-500 font-medium">No bookings found</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {bookings.map((booking) => (
                                    <div key={booking._id || booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-forest-950 truncate">
                                                {booking.activity?.title || 'Activity'}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {booking.date ? new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                {booking.startTime && ` · ${booking.startTime}${booking.endTime ? `–${booking.endTime}` : ''}`}
                                                {booking.participants && ` · ${booking.participants} person${booking.participants !== 1 ? 's' : ''}`}
                                            </p>
                                            {booking.totalPrice != null && (
                                                <p className="text-xs text-forest-700 font-semibold mt-0.5">${booking.totalPrice.toFixed(2)}</p>
                                            )}
                                            {isProvider && booking.user && (
                                                <p className="text-xs text-gray-400 mt-0.5">{booking.user.username || booking.user.email}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {booking.status}
                                            </span>
                                            {isProvider && booking.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id || booking.id, 'confirmed')}
                                                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id || booking.id, 'rejected')}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Activity Form (slide-over) ── */}
            <ActivityForm
                isOpen={showForm}
                activity={editingActivity}
                loading={formLoading}
                onClose={() => setShowForm(false)}
                onSubmit={handleFormSubmit}
            />

            {/* ── Delete Confirmation ── */}
            <ConfirmModal
                isOpen={confirmDelete.open}
                title="Delete Activity"
                message={`"${confirmDelete.title}" will be permanently deleted and removed from all listings. This cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmDelete({ open: false, id: null, title: '' })}
                loading={!!deletingId}
            />
        </div>
    );
};

export default DashboardPage;
