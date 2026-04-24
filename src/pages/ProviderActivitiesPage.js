import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import {
    fetchProviderActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    selectProviderActivities,
    selectProviderActivitiesLoading,
    selectProviderActivitiesError,
} from '../redux/activities/activitiesSlice';
import { selectIsAuthenticated, selectUser, selectUserRole } from '../redux/auth/authSlice';
import { showToast } from '../redux/ui/uiSlice';
import ActivityForm from '../components/ActivityForm';
import ConfirmModal from '../components/ConfirmModal';
import Spinner from '../components/Spinner';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
    Adventure: 'bg-orange-100 text-orange-700',
    Cultural: 'bg-amber-100 text-amber-700',
    'Food & Culture': 'bg-red-50 text-red-700',
    Wellness: 'bg-forest-100 text-forest-700',
    Sightseeing: 'bg-sky-100 text-sky-700',
    Beach: 'bg-sky-100 text-sky-700',
    Hiking: 'bg-lime-100 text-lime-700',
    Photography: 'bg-purple-100 text-purple-700',
    'Arts & Crafts': 'bg-pink-100 text-pink-700',
    'Water Sports': 'bg-cyan-100 text-cyan-700',
    Cooking: 'bg-yellow-100 text-yellow-700',
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const EditIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const SpinnerInline = () => (
    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

const LocationIcon = () => (
    <svg className="w-3 h-3 text-forest-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 6v6l4 2" />
    </svg>
);

const ImagePlaceholder = () => (
    <svg className="w-10 h-10 text-forest-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16l5-5 4 4 3-3 4 4" />
        <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
);

// ── Activity Card ─────────────────────────────────────────────────────────────

const ActivityCard = ({ activity, onEdit, onDelete, isDeleting }) => {
    const thumb = activity.images?.[0] || activity.image;
    const catCls = CATEGORY_COLORS[activity.category] || 'bg-gray-100 text-gray-700';
    const actId = activity._id || activity.id;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
            {/* Thumbnail */}
            {thumb ? (
                <div className="h-40 overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    <img
                        src={thumb}
                        alt={activity.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.parentElement.classList.add('hidden'); }}
                    />
                </div>
            ) : (
                <div className="h-40 bg-gradient-to-br from-forest-50 to-forest-100 flex items-center justify-center flex-shrink-0">
                    <ImagePlaceholder />
                </div>
            )}

            <div className="p-5 flex flex-col gap-3 flex-1">
                {/* Category + title */}
                <div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catCls}`}>
                        {activity.category}
                    </span>
                    <h3 className="font-bold text-forest-950 mt-2.5 text-base leading-snug line-clamp-1">
                        {activity.title}
                    </h3>
                    {activity.description && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                            {activity.description}
                        </p>
                    )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    {activity.city && (
                        <span className="flex items-center gap-1">
                            <LocationIcon />
                            {activity.city}
                        </span>
                    )}
                    {activity.duration != null && (
                        <span className="flex items-center gap-1">
                            <ClockIcon />
                            {typeof activity.duration === 'number'
                                ? `${activity.duration}h`
                                : activity.duration}
                        </span>
                    )}
                    {activity.maxParticipants != null && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Max {activity.maxParticipants}
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <span className="font-bold text-forest-900 text-sm">
                        {activity.price?.toLocaleString()} MAD
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(activity)}
                            title="Edit activity"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
                        >
                            <EditIcon />
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(actId, activity.title)}
                            disabled={isDeleting}
                            title="Delete activity"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                            {isDeleting ? <SpinnerInline /> : <TrashIcon />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Empty State ───────────────────────────────────────────────────────────────

const EmptyActivities = ({ onAdd }) => (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-forest-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-forest-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        </div>
        <h3 className="text-lg font-bold text-forest-950 mb-1">No activities yet</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Create your first activity to start receiving bookings from adventure seekers.
        </p>
        <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest-900 text-white text-sm font-semibold hover:bg-forest-800 transition-colors shadow-md shadow-forest-900/20"
        >
            <PlusIcon />
            Create your first activity
        </button>
    </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const ProviderActivitiesPage = () => {
    const dispatch = useDispatch();

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const role = useSelector(selectUserRole);

    const activities = useSelector(selectProviderActivities);
    const loading = useSelector(selectProviderActivitiesLoading);
    const fetchError = useSelector(selectProviderActivitiesError);

    const [showForm, setShowForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, title: '' });
    const [deletingId, setDeletingId] = useState(null);

    const isProvider = role === 'prestataire' || role === 'admin';

    useEffect(() => {
        if (isAuthenticated && isProvider) {
            dispatch(fetchProviderActivities(user?._id || user?.id));
        }
    }, [dispatch, isAuthenticated, isProvider, user]);

    // Redirect after all hooks have been called
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isProvider) return <Navigate to="/" replace />;

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
                dispatch(showToast({ message: 'Activity updated successfully!', type: 'success' }));
            } else {
                await dispatch(createActivity(payload)).unwrap();
                dispatch(showToast({ message: 'Activity created successfully!', type: 'success' }));
            }
            setShowForm(false);
        } catch (err) {
            dispatch(showToast({ message: err || 'Something went wrong. Please try again.', type: 'error' }));
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
            dispatch(showToast({ message: 'Activity deleted.', type: 'success' }));
            setConfirmDelete({ open: false, id: null, title: '' });
        } catch (err) {
            dispatch(showToast({ message: err || 'Delete failed. Please try again.', type: 'error' }));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-28">
            <div className="container mx-auto px-6 max-w-6xl pb-16">

                {/* ── Page header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-forest-950">My Activities</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage your activities —
                            <span className="ml-1 font-semibold text-forest-700">
                                {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="self-start sm:self-auto inline-flex items-center gap-2 bg-forest-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-forest-800 transition-colors shadow-md shadow-forest-900/20"
                    >
                        <PlusIcon />
                        Add Activity
                    </button>
                </div>

                {/* ── Error banner ── */}
                {fetchError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-red-700">Could not load activities</p>
                            <p className="text-xs text-red-600 mt-0.5">{fetchError}</p>
                        </div>
                        <button
                            onClick={() => dispatch(fetchProviderActivities(user?._id || user?.id))}
                            className="ml-auto text-xs font-semibold text-red-600 hover:text-red-800 underline transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Content ── */}
                {loading ? (
                    <Spinner className="py-24" />
                ) : activities.length === 0 ? (
                    <EmptyActivities onAdd={openCreate} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {activities.map((act) => (
                            <ActivityCard
                                key={act._id || act.id}
                                activity={act}
                                onEdit={openEdit}
                                onDelete={handleDeleteRequest}
                                isDeleting={deletingId === (act._id || act.id)}
                            />
                        ))}
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

            {/* ── Delete Confirmation Modal ── */}
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

export default ProviderActivitiesPage;
