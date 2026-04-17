import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    createBooking,
    selectCreateBookingLoading,
    selectLastCreatedBooking,
    clearLastCreated,
} from '../redux/bookings/bookingsSlice';
import { showToast } from '../redux/ui/uiSlice';
import { selectIsAuthenticated, selectUserRole } from '../redux/auth/authSlice';

const XIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';

const TIME_SLOTS = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

/**
 * BookingModal
 *
 * Props:
 *   activity  – activity object
 *   isOpen    – boolean controlling visibility
 *   onClose   – () => void
 */
const BookingModal = ({ activity, isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const userRole = useSelector(selectUserRole);
    const loading = useSelector(selectCreateBookingLoading);
    const lastCreated = useSelector(selectLastCreatedBooking);

    const today = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        date: '',
        time: '09:00',
        participants: 1,
        notes: '',
    });
    const [errors, setErrors] = useState({});

    // Reset form whenever modal opens
    useEffect(() => {
        if (isOpen) {
            setForm({ date: '', time: '09:00', participants: 1, notes: '' });
            setErrors({});
        }
    }, [isOpen]);

    // Handle successful booking
    useEffect(() => {
        if (lastCreated && isOpen) {
            dispatch(showToast({ message: 'Booking confirmed! 🎉 Check My Bookings.', type: 'success' }));
            dispatch(clearLastCreated());
            onClose();
        }
    }, [lastCreated, isOpen, dispatch, onClose]);

    // Trap focus / close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen || !activity) return null;

    // ── Not logged in ─────────────────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fadeInUp">
                    <div className="w-16 h-16 rounded-full bg-gold-50 border-2 border-gold-200 flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">Sign in to book</h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        Create a free account or sign in to book <strong>{activity.title}</strong>.
                    </p>
                    <button
                        onClick={() => {
                            onClose();
                            navigate('/login', { state: { from: `/activities/${activity._id || activity.id}` } });
                        }}
                        className="w-full py-3 rounded-xl bg-forest-900 text-white font-bold hover:bg-forest-800 transition-colors mb-3"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            navigate('/register');
                        }}
                        className="w-full py-2.5 rounded-xl border-2 border-forest-900 text-forest-900 font-bold hover:bg-forest-50 transition-colors mb-3"
                    >
                        Create Account
                    </button>
                    <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        Maybe later
                    </button>
                </div>
            </div>
        );
    }

    // ── Wrong role ────────────────────────────────────────────────────────────
    if (userRole === 'prestataire' || userRole === 'admin') {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fadeInUp">
                    <p className="text-gray-600 mb-4">Provider and admin accounts cannot make bookings.</p>
                    <button onClick={onClose} className="text-sm text-forest-700 font-semibold hover:underline">Close</button>
                </div>
            </div>
        );
    }

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!form.date) {
            e.date = 'Please select a date.';
        } else if (form.date < today) {
            e.date = 'Date cannot be in the past.';
        }
        const p = Number(form.participants);
        if (!p || p < 1) {
            e.participants = 'At least 1 participant required.';
        } else if (activity.maxParticipants && p > activity.maxParticipants) {
            e.participants = `Max ${activity.maxParticipants} participants allowed.`;
        }
        return e;
    };

    const totalPrice = (activity.price || 0) * Number(form.participants || 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        setErrors({});
        dispatch(
            createBooking({
                activityId: activity._id || activity.id,
                providerId: activity.providerId || activity.provider,
                date: form.date,
                time: form.time,
                participants: Number(form.participants),
                totalPrice,
                ...(form.notes.trim() && { notes: form.notes.trim() }),
            })
        );
    };

    const imageUrl = activity.images?.[0] || activity.image || FALLBACK_IMAGE;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Book activity">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeInUp flex flex-col max-h-[90vh]">

                {/* Hero */}
                <div className="relative h-36 flex-shrink-0 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={activity.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { if (e.target.src !== FALLBACK_IMAGE) e.target.src = FALLBACK_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        aria-label="Close"
                    >
                        <XIcon />
                    </button>
                    <div className="absolute bottom-3 left-4 right-12">
                        <h2 className="text-white font-extrabold text-base leading-snug line-clamp-1">{activity.title}</h2>
                        <p className="text-white/75 text-sm">${activity.price} per person</p>
                    </div>
                </div>

                {/* Scrollable form */}
                <div className="overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                min={today}
                                value={form.date}
                                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition text-sm font-medium ${errors.date ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-forest-300'
                                    }`}
                            />
                            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
                        </div>

                        {/* Time + Participants */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time</label>
                                <select
                                    value={form.time}
                                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-300 text-sm font-medium"
                                >
                                    {TIME_SLOTS.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Participants <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={activity.maxParticipants || 99}
                                    value={form.participants}
                                    onChange={(e) => setForm((f) => ({ ...f, participants: e.target.value }))}
                                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition text-sm font-medium ${errors.participants ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-forest-300'
                                        }`}
                                />
                                {errors.participants && <p className="mt-1 text-xs text-red-500">{errors.participants}</p>}
                            </div>
                        </div>

                        {/* Capacity hint */}
                        {activity.maxParticipants && (
                            <p className="text-xs text-gray-400 -mt-3">
                                Up to {activity.maxParticipants} participants per booking
                            </p>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Special requests{' '}
                                <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <textarea
                                rows={2}
                                value={form.notes}
                                placeholder="Dietary requirements, accessibility needs, etc."
                                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-300 text-sm resize-none transition"
                            />
                        </div>

                        {/* Price summary */}
                        <div className="bg-forest-50 rounded-xl p-4 flex items-center justify-between border border-forest-100">
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-900">{form.participants || 1}</span> person{Number(form.participants) !== 1 ? 's' : ''}{' '}
                                × <span className="font-semibold">${activity.price}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-extrabold text-forest-900">${totalPrice.toFixed(2)}</div>
                                <div className="text-xs text-gray-400">total</div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-forest-900 text-white font-bold text-sm hover:bg-forest-800 active:bg-forest-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Confirming…
                                </>
                            ) : (
                                `Confirm Booking · $${totalPrice.toFixed(2)}`
                            )}
                        </button>

                        <p className="text-center text-xs text-gray-400 pb-1">
                            Free cancellation up to 24 hours before the activity
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
