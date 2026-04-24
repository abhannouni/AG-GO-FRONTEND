import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    createBooking,
    selectCreateBookingLoading,
    selectLastCreatedBooking,
    clearLastCreated,
} from '../redux/bookings/bookingsSlice';
import {
    fetchAvailableSlots,
    clearSlots,
    selectAvailableSlots,
    selectSlotsLoading,
    selectSlotsError,
    fetchCalendar,
    selectCalendarMap,
    selectCalendarLoading,
    clearCalendar,
} from '../redux/availability/availabilitySlice';
import { showToast } from '../redux/ui/uiSlice';
import { selectIsAuthenticated, selectUserRole } from '../redux/auth/authSlice';
import MiniCalendar from './MiniCalendar';

const XIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 6v6l4 2" />
    </svg>
);

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';

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
    const availableSlots = useSelector(selectAvailableSlots);
    const slotsLoading = useSelector(selectSlotsLoading);
    const slotsError = useSelector(selectSlotsError);
    const calendarMap = useSelector(selectCalendarMap);
    const calendarLoading = useSelector(selectCalendarLoading);

    const today = new Date().toISOString().split('T')[0];

    // ── Calendar navigation state ────────────────────────────────────────────
    const now = new Date();
    const [calYear, setCalYear] = useState(now.getFullYear());
    const [calMonth, setCalMonth] = useState(now.getMonth() + 1);

    const [form, setForm] = useState({
        date: '',
        startTime: '',
        participants: 1,
        notes: '',
    });
    const [errors, setErrors] = useState({});

    // Reset form whenever modal opens
    useEffect(() => {
        if (isOpen) {
            setForm({ date: '', startTime: '', participants: 1, notes: '' });
            setErrors({});
            dispatch(clearSlots());
            dispatch(clearCalendar());
            // Show current month
            const n = new Date();
            setCalYear(n.getFullYear());
            setCalMonth(n.getMonth() + 1);
        }
    }, [isOpen, dispatch]);

    // Fetch per-day status whenever the displayed month changes
    useEffect(() => {
        if (!isOpen || !activity) return;
        const activityId = activity._id || activity.id;
        dispatch(fetchCalendar({ activityId, year: calYear, month: calMonth }));
    }, [isOpen, activity, calYear, calMonth, dispatch]);

    // Fetch availability when date changes
    useEffect(() => {
        if (!form.date || !activity) return;
        const activityId = activity._id || activity.id;
        dispatch(fetchAvailableSlots({ activityId, date: form.date }));
        // Reset selected time when date changes
        setForm((f) => ({ ...f, startTime: '' }));
    }, [form.date, activity, dispatch]);

    // Auto-select if only one slot available
    useEffect(() => {
        if (availableSlots?.slots?.length === 1 && !form.startTime) {
            const only = availableSlots.slots[0];
            if (only.isAvailable) setForm((f) => ({ ...f, startTime: only.startTime }));
        }
    }, [availableSlots, form.startTime]);

    // Handle successful booking
    useEffect(() => {
        if (lastCreated && isOpen) {
            dispatch(showToast({ message: 'Booking confirmed! 🎉 Check My Bookings.', type: 'success' }));
            dispatch(clearLastCreated());
            onClose();
        }
    }, [lastCreated, isOpen, dispatch, onClose]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Build a flat dateStr→status map from the Redux calendar cache for this month
    // Must be called before any early returns (Rules of Hooks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const calendarStatusMap = useMemo(() => {
        const activityId = activity?._id || activity?.id;
        const key = `${activityId}-${calYear}-${calMonth}`;
        const days = calendarMap[key] || [];
        const map = {};
        for (const d of days) map[d.date] = d.status;
        return map;
        // calendarMap reference changes when a month's data is loaded
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calendarMap, calYear, calMonth]);

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
                        onClick={() => { onClose(); navigate('/login', { state: { from: `/activities/${activity._id || activity.id}` } }); }}
                        className="w-full py-3 rounded-xl bg-forest-900 text-white font-bold hover:bg-forest-800 transition-colors mb-3"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => { onClose(); navigate('/register'); }}
                        className="w-full py-2.5 rounded-xl border-2 border-forest-900 text-forest-900 font-bold hover:bg-forest-50 transition-colors mb-3"
                    >
                        Create Account
                    </button>
                    <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Maybe later</button>
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

    // ── Derived values ────────────────────────────────────────────────────────
    const slots = availableSlots?.slots ?? [];
    const durationHours = availableSlots?.durationHours ?? activity.duration;
    const selectedSlot = slots.find((s) => s.startTime === form.startTime);

    const numParticipants = Number(form.participants || 1);
    const totalPrice = (activity.price || 0) * numParticipants;

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!form.date) {
            e.date = 'Please select a date.';
        } else if (form.date < today) {
            e.date = 'Date cannot be in the past.';
        }
        if (!form.startTime) {
            e.startTime = 'Please choose a time slot.';
        } else if (selectedSlot && !selectedSlot.isAvailable) {
            e.startTime = 'This slot is fully booked. Please pick another.';
        }
        const p = Number(form.participants);
        if (!p || p < 1) {
            e.participants = 'At least 1 participant required.';
        } else if (activity.maxParticipants && p > activity.maxParticipants) {
            e.participants = `Max ${activity.maxParticipants} participants allowed.`;
        } else if (selectedSlot && p > selectedSlot.remainingSpots) {
            e.participants = `Only ${selectedSlot.remainingSpots} spot(s) remaining in this slot.`;
        }
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        dispatch(
            createBooking({
                activityId: activity._id || activity.id,
                date: form.date,
                startTime: form.startTime,
                participants: numParticipants,
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
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeInUp flex flex-col max-h-[92vh]">

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
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-white/75 text-sm">${activity.price} per person</span>
                            {durationHours && (
                                <span className="flex items-center gap-1 text-white/75 text-sm">
                                    <ClockIcon />
                                    {durationHours}h
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scrollable form */}
                <div className="overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>

                        {/* Date — Calendar picker */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Select Date <span className="text-red-500">*</span>
                                </label>
                                {form.date && (
                                    <span className="text-xs text-forest-700 font-semibold">
                                        {new Date(form.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </span>
                                )}
                            </div>
                            <MiniCalendar
                                year={calYear}
                                month={calMonth}
                                onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m); }}
                                selectedDate={form.date}
                                onDateSelect={(ds) => setForm((f) => ({ ...f, date: ds, startTime: '' }))}
                                dateStatusMap={calendarStatusMap}
                                loading={calendarLoading}
                                minDate={today}
                                showLegend={true}
                            />
                            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
                        </div>

                        {/* Time slots */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Time Slot <span className="text-red-500">*</span>
                            </label>

                            {!form.date ? (
                                <p className="text-sm text-gray-400 italic">Select a date to see available slots.</p>
                            ) : slotsLoading ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                                    <svg className="w-4 h-4 animate-spin text-forest-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Checking availability…
                                </div>
                            ) : slotsError ? (
                                <p className="text-sm text-red-500">{slotsError}</p>
                            ) : slots.length === 0 ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                                    No availability defined for this date. Please choose a different date.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {slots.map((slot) => {
                                        const isSelected = form.startTime === slot.startTime;
                                        const isDisabled = !slot.isAvailable;
                                        return (
                                            <button
                                                key={slot.startTime}
                                                type="button"
                                                disabled={isDisabled}
                                                onClick={() => !isDisabled && setForm((f) => ({ ...f, startTime: slot.startTime }))}
                                                className={`relative px-3 py-2.5 rounded-xl border text-left transition-all flex flex-col gap-0.5
                                                    ${isSelected
                                                        ? 'bg-forest-900 border-forest-900 text-white shadow-md'
                                                        : isDisabled
                                                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                                            : 'bg-white border-gray-200 text-gray-800 hover:border-forest-400 hover:bg-forest-50 cursor-pointer'
                                                    }`}
                                            >
                                                <span className={`text-sm font-bold ${isSelected ? 'text-white' : isDisabled ? 'text-gray-300' : 'text-gray-900'}`}>
                                                    {slot.startTime} → {slot.endTime}
                                                </span>
                                                <span className={`text-xs ${isSelected ? 'text-white/70' : isDisabled ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {isDisabled ? 'Fully booked' : `${slot.remainingSpots} spot${slot.remainingSpots !== 1 ? 's' : ''} left`}
                                                </span>
                                                {isDisabled && (
                                                    <span className="absolute top-1.5 right-2 text-[10px] font-semibold text-gray-300">✕</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime}</p>}
                        </div>

                        {/* Duration info */}
                        {selectedSlot && (
                            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm text-blue-700">
                                <ClockIcon />
                                <span>
                                    <strong>{selectedSlot.startTime}</strong> to <strong>{selectedSlot.endTime}</strong>
                                    {durationHours && ` · ${durationHours} hour${durationHours !== 1 ? 's' : ''}`}
                                </span>
                            </div>
                        )}

                        {/* Participants */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Participants <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={selectedSlot ? selectedSlot.remainingSpots : (activity.maxParticipants || 99)}
                                value={form.participants}
                                onChange={(e) => setForm((f) => ({ ...f, participants: e.target.value }))}
                                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition text-sm font-medium ${errors.participants ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-forest-300'}`}
                            />
                            {errors.participants && <p className="mt-1 text-xs text-red-500">{errors.participants}</p>}
                            {selectedSlot && (
                                <p className="mt-1 text-xs text-gray-400">
                                    {selectedSlot.remainingSpots} spot{selectedSlot.remainingSpots !== 1 ? 's' : ''} remaining in this slot
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Special requests <span className="text-gray-400 font-normal">(optional)</span>
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
                                <span className="font-semibold text-gray-900">{form.participants || 1}</span>
                                {' '}person{Number(form.participants) !== 1 ? 's' : ''}{' '}
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
                            disabled={loading || slots.length === 0 || slotsLoading}
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
