import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchActivities, createActivity, updateActivity, deleteActivity,
    selectActivities, selectActivitiesLoading, selectActivitiesError,
} from '../redux/activities/activitiesSlice';
import {
    fetchMyBookings, fetchProviderBookings, updateBookingStatus,
    selectMyBookings, selectProviderBookings, selectBookingsLoading, selectBookingsError,
} from '../redux/bookings/bookingsSlice';
import { selectIsAuthenticated, selectUser, selectUserRole } from '../redux/auth/authSlice';
import { showToast } from '../redux/ui/uiSlice';
import Spinner from '../components/Spinner';

const STATUS_BADGE = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
};

const EMPTY_ACTIVITY = { title: '', description: '', category: 'Adventure', price: '', location: '', city: '' };

const DashboardPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const role = useSelector(selectUserRole);

    const activities = useSelector(selectActivities);
    const activitiesLoading = useSelector(selectActivitiesLoading);
    const activitiesError = useSelector(selectActivitiesError);

    const myBookings = useSelector(selectMyBookings);
    const providerBookings = useSelector(selectProviderBookings);
    const bookingsLoading = useSelector(selectBookingsLoading);
    const bookingsError = useSelector(selectBookingsError);

    const [tab, setTab] = useState(role === 'client' ? 'bookings' : 'activities');
    const [showForm, setShowForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [formData, setFormData] = useState(EMPTY_ACTIVITY);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (role === 'client') {
            dispatch(fetchMyBookings());
        } else {
            dispatch(fetchActivities());
            dispatch(fetchProviderBookings());
        }
    }, [dispatch, isAuthenticated, role, navigate]);

    const handleFormChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const openCreate = () => {
        setEditingActivity(null);
        setFormData(EMPTY_ACTIVITY);
        setShowForm(true);
    };

    const openEdit = (activity) => {
        setEditingActivity(activity);
        setFormData({
            title: activity.title || '',
            description: activity.description || '',
            category: activity.category || 'Adventure',
            price: activity.price || '',
            location: activity.location || '',
            city: activity.city || '',
        });
        setShowForm(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (editingActivity) {
                await dispatch(updateActivity({ id: editingActivity._id || editingActivity.id, data: formData })).unwrap();
                dispatch(showToast({ message: 'Activity updated!', type: 'success' }));
            } else {
                await dispatch(createActivity(formData)).unwrap();
                dispatch(showToast({ message: 'Activity created!', type: 'success' }));
            }
            setShowForm(false);
            dispatch(fetchActivities());
        } catch (err) {
            dispatch(showToast({ message: err || 'Something went wrong', type: 'error' }));
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this activity?')) return;
        try {
            await dispatch(deleteActivity(id)).unwrap();
            dispatch(showToast({ message: 'Activity deleted', type: 'success' }));
            dispatch(fetchActivities());
        } catch (err) {
            dispatch(showToast({ message: err || 'Delete failed', type: 'error' }));
        }
    };

    const handleStatusUpdate = async (bookingId, status) => {
        try {
            await dispatch(updateBookingStatus({ id: bookingId, status })).unwrap();
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
                                {activities.map((act) => (
                                    <div key={act._id || act.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                                        <div>
                                            <span className="text-xs font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full">{act.category}</span>
                                            <h3 className="font-bold text-forest-950 mt-2 text-base">{act.title}</h3>
                                            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{act.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mt-auto pt-3 border-t border-gray-50">
                                            <span className="font-bold text-forest-900">{act.price} MAD</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(act)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors">Edit</button>
                                                <button onClick={() => handleDelete(act._id || act.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                                {booking.participants && ` · ${booking.participants} person${booking.participants !== 1 ? 's' : ''}`}
                                            </p>
                                            {isProvider && booking.user && (
                                                <p className="text-xs text-gray-400 mt-0.5">{booking.user.name || booking.user.email}</p>
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

            {/* ── Activity Form Modal ── */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-7">
                        <h2 className="text-xl font-bold text-forest-950 mb-5">
                            {editingActivity ? 'Edit Activity' : 'New Activity'}
                        </h2>
                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                            {[
                                { name: 'title', label: 'Title', type: 'text', placeholder: 'e.g. Desert Camel Trek' },
                                { name: 'price', label: 'Price (MAD)', type: 'number', placeholder: '0' },
                                { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Merzouga Dunes' },
                                { name: 'city', label: 'City', type: 'text', placeholder: 'e.g. Merzouga' },
                            ].map(({ name, label, type, placeholder }) => (
                                <div key={name}>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                                    <input
                                        type={type}
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleFormChange}
                                        placeholder={placeholder}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-700 transition-colors"
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-900/20 bg-white"
                                >
                                    {['Adventure', 'Cultural', 'Food & Culture', 'Wellness', 'Beach'].map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Describe the activity..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-700 transition-colors resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 py-3 rounded-xl bg-forest-900 text-white text-sm font-semibold hover:bg-forest-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {formLoading ? <Spinner size="sm" /> : editingActivity ? 'Save Changes' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
