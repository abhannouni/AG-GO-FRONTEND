import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAvailability,
    fetchAvailableSlots,
    saveAvailability,
    deleteAvailability,
    saveBulkAvailability,
    selectAvailabilityRecords,
    selectAvailabilityLoading,
    selectSaveLoading,
    selectBulkSaveLoading,
    selectAvailabilityError,
    selectAvailableSlots,
    selectSlotsLoading,
    clearAvailabilityError,
    clearSlots,
} from '../redux/availability/availabilitySlice';
import { showToast } from '../redux/ui/uiSlice';
import MiniCalendar from './MiniCalendar';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Half-hour time options (00:00 … 23:30) */
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2, '0')}:${m}`;
});

const WEEKDAY_LIST = [
    { label: 'Mo', value: 1 },
    { label: 'Tu', value: 2 },
    { label: 'We', value: 3 },
    { label: 'Th', value: 4 },
    { label: 'Fr', value: 5 },
    { label: 'Sa', value: 6 },
    { label: 'Su', value: 0 },
];

const POLL_INTERVAL = 30_000; // 30 seconds
const TIMELINE_START = 6;      // 6 am — earliest visible hour
const TIMELINE_END = 23;     // 11 pm
const ROW_HEIGHT = 56;     // px per hour

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().split('T')[0];

const toDateStr = (dateVal) => {
    const d = new Date(dateVal);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

const shiftDate = (dateStr, deltaDays) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + deltaDays);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

const fromMinutes = (mins) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** Derive endTime from startTime + durationHours */
const computeEndTime = (startTime, durationHours) => {
    if (!startTime || !durationHours) return null;
    return fromMinutes(toMinutes(startTime) + Math.round(Number(durationHours) * 60));
};

/**
 * Returns a human-readable conflict description if newStartTime
 * overlaps with any of existingSlots (given a fixed activity duration).
 */
const findSlotConflict = (newStartTime, durationHours, existingSlots, excludeStart = null) => {
    if (!newStartTime || !durationHours || !existingSlots?.length) return null;
    const durMins = Math.round(Number(durationHours) * 60);
    const newStart = toMinutes(newStartTime);
    const newEnd = newStart + durMins;
    for (const slot of existingSlots) {
        if (slot.startTime === excludeStart) continue;
        const s = toMinutes(slot.startTime);
        const e = s + durMins;
        if (newStart < e && newEnd > s) {
            return `Overlaps with ${slot.startTime} \u2192 ${fromMinutes(e)}`;
        }
    }
    return null;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Enhanced slot card showing startTime → endTime, spots, and live booking occupancy.
 * `enriched` comes from the getSlots API response and may be null if not yet loaded.
 */
const SlotCard = ({ slot, endTime, enriched, onRemove }) => {
    const hasOccupancy = enriched != null;
    const bookedCount = hasOccupancy ? enriched.availableSpots - enriched.remainingSpots : 0;
    const isFull = hasOccupancy && enriched.remainingSpots === 0;
    const isPartial = hasOccupancy && !isFull && bookedCount > 0;
    const fraction = hasOccupancy && enriched.availableSpots > 0
        ? bookedCount / enriched.availableSpots : 0;

    return (
        <div className={`rounded-xl border px-4 py-3 flex flex-col gap-2 transition-colors ${isFull ? 'bg-red-50 border-red-200'
            : isPartial ? 'bg-amber-50 border-amber-200'
                : 'bg-forest-50 border-forest-100'
            }`}>
            <div className="flex items-center gap-2 flex-wrap">
                {/* Time range */}
                <div className="flex items-center gap-1.5 font-bold text-sm tabular-nums mr-1">
                    <span className="text-forest-900">{slot.startTime}</span>
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    {endTime
                        ? <span className="text-forest-700">{endTime}</span>
                        : <span className="text-gray-400 text-xs font-normal italic">calculating…</span>}
                </div>

                <span className="text-gray-300 text-xs">·</span>
                <span className="text-gray-500 text-xs">{slot.availableSpots} spot{slot.availableSpots !== 1 ? 's' : ''}</span>

                {/* Occupancy badge */}
                {hasOccupancy && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isFull ? 'bg-red-100 text-red-600'
                        : isPartial ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {isFull
                            ? 'Fully booked'
                            : bookedCount > 0
                                ? `${bookedCount} booked \xb7 ${enriched.remainingSpots} left`
                                : 'Open \u2014 no bookings yet'}
                    </span>
                )}

                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="ml-auto text-red-400 hover:text-red-600 transition-colors text-xs font-bold px-1 flex-shrink-0"
                        aria-label="Remove slot"
                    >
                        &#x2715;
                    </button>
                )}
            </div>

            {/* Occupancy bar */}
            {hasOccupancy && bookedCount > 0 && (
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-400' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(100, fraction * 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
};

/**
 * Slot adder with live conflict detection — disables the Add button when the new
 * slot's window (startTime + activity duration) overlaps an existing slot.
 */
const SlotAdder = ({ time, setTime, spots, setSpots, onAdd, conflict, endTimePreview }) => (
    <div className="space-y-2">
        <div className="flex flex-wrap items-end gap-2">
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time</label>
                <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-300 text-sm"
                >
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Spots</label>
                <input
                    type="number" min="1" max="200"
                    value={spots}
                    onChange={(e) => setSpots(e.target.value)}
                    className="w-20 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-300 text-sm"
                />
            </div>
            <div className="flex flex-col">
                {endTimePreview && (
                    <span className="text-[11px] text-gray-400 mb-1 tabular-nums">
                        ends&nbsp;{endTimePreview}
                    </span>
                )}
                <button
                    type="button"
                    onClick={onAdd}
                    disabled={!!conflict}
                    className="px-3 py-2 bg-forest-100 text-forest-800 rounded-xl text-sm font-semibold hover:bg-forest-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    + Add Slot
                </button>
            </div>
        </div>

        {conflict && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <svg className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span className="text-xs text-amber-700 font-medium">{conflict}</span>
            </div>
        )}
    </div>
);

// ─── Timeline View ────────────────────────────────────────────────────────────

/**
 * Vertical time-grid showing all slots for the selected date.
 * Slot blocks are positioned absolutely; height reflects the activity duration.
 * Color: emerald = open, amber = partially booked, red = fully booked.
 */
const TimelineView = ({ slots, isBlocked, durationHours, selectedDate, minDate, onDateChange }) => {
    const hours = Array.from({ length: TIMELINE_END - TIMELINE_START + 1 }, (_, i) => i + TIMELINE_START);
    const totalHeight = (TIMELINE_END - TIMELINE_START) * ROW_HEIGHT;

    const getSlotStyle = (startTime) => {
        const startMins = toMinutes(startTime);
        const top = ((startMins / 60) - TIMELINE_START) * ROW_HEIGHT;
        const height = Math.round(Number(durationHours) * 60) / 60 * ROW_HEIGHT;
        return { top: `${Math.max(0, top)}px`, height: `${Math.max(height, 30)}px` };
    };

    if (!selectedDate) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
                <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-400 font-medium">Select a date in the Calendar tab</p>
                <p className="text-xs text-gray-300 mt-1">to see its schedule here</p>
            </div>
        );
    }

    const dateLabel = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const canGoPrev = selectedDate > minDate;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h4 className="font-bold text-gray-800 text-sm">{dateLabel}</h4>
                    {isBlocked && (
                        <span className="text-xs font-semibold text-red-500 mt-0.5 block">&#x26D4; Entire day blocked by provider</span>
                    )}
                    {!isBlocked && slots.length > 0 && (
                        <span className="text-xs text-gray-500 mt-0.5 block">
                            {slots.length} time slot{slots.length !== 1 ? 's' : ''} &middot; {durationHours}h per slot
                        </span>
                    )}
                    {!isBlocked && slots.length === 0 && (
                        <span className="text-xs text-gray-400 mt-0.5 block">No availability defined &mdash; go to Calendar tab to add slots</span>
                    )}
                </div>

                {/* Timeline date controls */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={!canGoPrev}
                        onClick={() => canGoPrev && onDateChange(shiftDate(selectedDate, -1))}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Prev
                    </button>
                    <input
                        type="date"
                        min={minDate}
                        value={selectedDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
                    />
                    <button
                        type="button"
                        onClick={() => onDateChange(shiftDate(selectedDate, 1))}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 flex-wrap">
                    {[
                        ['bg-emerald-400', 'Available'],
                        ['bg-amber-400', 'Partially booked'],
                        ['bg-red-400', 'Fully booked'],
                    ].map(([cls, label]) => (
                        <span key={label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <span className={`w-2.5 h-2.5 rounded-sm inline-block ${cls}`} />
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto max-h-[560px]">
                <div className="relative" style={{ height: `${totalHeight}px` }}>

                    {/* Hour rows */}
                    {hours.map((h) => (
                        <React.Fragment key={h}>
                            <div
                                className="absolute w-full flex items-start"
                                style={{ top: `${(h - TIMELINE_START) * ROW_HEIGHT}px`, height: `${ROW_HEIGHT}px` }}
                            >
                                <div className="w-14 pr-3 flex-shrink-0 text-right pt-0.5">
                                    <span className="text-[11px] text-gray-400 tabular-nums leading-none">
                                        {String(h).padStart(2, '0')}:00
                                    </span>
                                </div>
                                <div className="flex-1 border-t border-gray-100 h-full" />
                            </div>
                            {/* Half-hour dashed tick */}
                            <div
                                className="absolute w-full flex"
                                style={{ top: `${(h - TIMELINE_START) * ROW_HEIGHT + ROW_HEIGHT / 2}px` }}
                            >
                                <div className="w-14 pr-3 flex-shrink-0 text-right">
                                    <span className="text-[10px] text-gray-300 tabular-nums leading-none">
                                        {String(h).padStart(2, '0')}:30
                                    </span>
                                </div>
                                <div className="flex-1 border-t border-dashed border-gray-100" />
                            </div>
                        </React.Fragment>
                    ))}

                    {/* Slots overlay */}
                    <div className="absolute" style={{ left: '56px', right: '8px', top: 0, bottom: 0 }}>
                        {isBlocked ? (
                            <div className="absolute inset-2 bg-red-50 border border-dashed border-red-200 rounded-xl flex items-center justify-center">
                                <span className="text-red-400 font-semibold text-sm">&#x26D4; No bookings accepted &mdash; day blocked</span>
                            </div>
                        ) : (
                            slots.map((slot) => {
                                const endT = slot.endTime ?? computeEndTime(slot.startTime, durationHours);
                                const bookedCount = (slot.availableSpots != null && slot.remainingSpots != null)
                                    ? slot.availableSpots - slot.remainingSpots : 0;
                                const fraction = slot.availableSpots > 0 ? bookedCount / slot.availableSpots : 0;
                                const isFull = slot.remainingSpots === 0 && slot.availableSpots != null && slot.remainingSpots != null;
                                const isPart = !isFull && bookedCount > 0;
                                const slotStyle = getSlotStyle(slot.startTime);

                                return (
                                    <div
                                        key={slot.startTime}
                                        className={`absolute left-1 right-1 rounded-xl border px-3 flex flex-col justify-center overflow-hidden ${isFull ? 'bg-red-50 border-red-200'
                                            : isPart ? 'bg-amber-50 border-amber-200'
                                                : 'bg-emerald-50 border-emerald-200'
                                            }`}
                                        style={slotStyle}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`font-bold text-xs tabular-nums truncate ${isFull ? 'text-red-700'
                                                : isPart ? 'text-amber-700'
                                                    : 'text-emerald-700'
                                                }`}>
                                                {slot.startTime} &rarr; {endT}
                                            </span>
                                            <span className={`text-[11px] font-semibold flex-shrink-0 ${isFull ? 'text-red-500'
                                                : isPart ? 'text-amber-600'
                                                    : 'text-emerald-600'
                                                }`}>
                                                {isFull
                                                    ? 'Full'
                                                    : `${slot.remainingSpots ?? slot.availableSpots}/${slot.availableSpots}`}
                                            </span>
                                        </div>
                                        {bookedCount > 0 && (
                                            <div className="mt-1 h-1 bg-white/60 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${isFull ? 'bg-red-400' : 'bg-amber-400'}`}
                                                    style={{ width: `${Math.min(100, fraction * 100)}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AvailabilityManager = ({ activities = [] }) => {
    const dispatch = useDispatch();
    const records = useSelector(selectAvailabilityRecords);
    const loading = useSelector(selectAvailabilityLoading);
    const saveLoading = useSelector(selectSaveLoading);
    const bulkLoading = useSelector(selectBulkSaveLoading);
    const error = useSelector(selectAvailabilityError);
    const slotsData = useSelector(selectAvailableSlots);
    const slotsLoading = useSelector(selectSlotsLoading);

    const [selectedActivityId, setSelectedActivityId] = useState(activities[0]?._id || '');
    const [activeTab, setActiveTab] = useState('calendar');

    const now = new Date();
    const [calYear, setCalYear] = useState(now.getFullYear());
    const [calMonth, setCalMonth] = useState(now.getMonth() + 1);

    const [selectedDate, setSelectedDate] = useState(null);
    const [editSlots, setEditSlots] = useState([]);
    const [editBlocked, setEditBlocked] = useState(false);
    const [newTime, setNewTime] = useState('09:00');
    const [newSpots, setNewSpots] = useState(10);
    const [deletingId, setDeletingId] = useState(null);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    // Bulk state
    const [bulkStart, setBulkStart] = useState('');
    const [bulkEnd, setBulkEnd] = useState('');
    const [bulkWeekdays, setBulkWeekdays] = useState([1, 2, 3, 4, 5]);
    const [bulkSlots, setBulkSlots] = useState([{ startTime: '09:00', availableSpots: 10 }]);
    const [bulkNewTime, setBulkNewTime] = useState('09:00');
    const [bulkNewSpots, setBulkNewSpots] = useState(10);
    const [bulkBlocked, setBulkBlocked] = useState(false);

    // Refs used inside the polling interval to avoid stale-closure bugs
    const pollRef = useRef(null);
    const selectedDateRef = useRef(selectedDate);
    const selectedActivityRef = useRef(selectedActivityId);

    useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);
    useEffect(() => { selectedActivityRef.current = selectedActivityId; }, [selectedActivityId]);

    // ── Polling: refresh availability + slots every 30 s ─────────────────────
    useEffect(() => {
        if (!selectedActivityId) {
            clearInterval(pollRef.current);
            return;
        }
        const refresh = () => {
            const actId = selectedActivityRef.current;
            const dateStr = selectedDateRef.current;
            if (!actId) return;
            dispatch(fetchAvailability({ activityId: actId }));
            if (dateStr) dispatch(fetchAvailableSlots({ activityId: actId, date: dateStr }));
            setLastRefreshed(new Date());
        };
        refresh();
        pollRef.current = setInterval(refresh, POLL_INTERVAL);
        return () => clearInterval(pollRef.current);
    }, [selectedActivityId, dispatch]);

    // ── Fetch enriched slot data whenever the selected date changes ───────────
    useEffect(() => {
        if (!selectedDate || !selectedActivityId) {
            dispatch(clearSlots());
            return;
        }
        dispatch(fetchAvailableSlots({ activityId: selectedActivityId, date: selectedDate }));
    }, [selectedDate, selectedActivityId, dispatch]);

    useEffect(() => () => dispatch(clearAvailabilityError()), [dispatch]);

    // ── Sync editor state to the record for the selected date ─────────────────
    useEffect(() => {
        if (!selectedDate) { setEditSlots([]); setEditBlocked(false); return; }
        const rec = records.find((r) => toDateStr(r.date) === selectedDate);
        if (rec) {
            setEditBlocked(rec.isBlocked || false);
            setEditSlots(rec.isBlocked ? [] : [...(rec.timeSlots || [])]);
        } else {
            setEditBlocked(false);
            setEditSlots([]);
        }
    }, [selectedDate, records]);

    // ── Derived data ──────────────────────────────────────────────────────────

    const dateStatusMap = useMemo(() => {
        const map = {};
        const today = todayStr();
        for (const rec of records) {
            const ds = toDateStr(rec.date);
            if (ds < today) map[ds] = 'past';
            else if (rec.isBlocked) map[ds] = 'blocked';
            else if (rec.timeSlots?.length > 0) map[ds] = 'available';
        }
        return map;
    }, [records]);

    const selectedActivity = useMemo(
        () => activities.find((a) => (a._id || a.id) === selectedActivityId),
        [activities, selectedActivityId]
    );

    /** startTime → enriched server slot (remainingSpots, endTime, isAvailable, …) */
    const enrichedSlotsMap = useMemo(() => {
        if (!slotsData?.slots?.length) return {};
        return Object.fromEntries(slotsData.slots.map((s) => [s.startTime, s]));
    }, [slotsData]);

    /** Use enriched data for Timeline when available, else derive from local editSlots */
    const timelineSlots = useMemo(() => {
        if (slotsData?.slots?.length > 0) return slotsData.slots;
        return editSlots.map((s) => ({
            ...s,
            endTime: computeEndTime(s.startTime, selectedActivity?.duration),
            remainingSpots: s.availableSpots,
        }));
    }, [slotsData, editSlots, selectedActivity]);

    const addSlotConflict = useMemo(
        () => findSlotConflict(newTime, selectedActivity?.duration, editSlots),
        [newTime, editSlots, selectedActivity]
    );
    const addSlotEndPreview = useMemo(
        () => computeEndTime(newTime, selectedActivity?.duration),
        [newTime, selectedActivity]
    );

    const bulkAddSlotConflict = useMemo(
        () => findSlotConflict(bulkNewTime, selectedActivity?.duration, bulkSlots),
        [bulkNewTime, bulkSlots, selectedActivity]
    );
    const bulkAddSlotEndPreview = useMemo(
        () => computeEndTime(bulkNewTime, selectedActivity?.duration),
        [bulkNewTime, selectedActivity]
    );

    // ── Handlers ──────────────────────────────────────────────────────────────

    const addSlotToList = (slots, setSlots, time, spots) => {
        if (slots.find((s) => s.startTime === time)) {
            dispatch(showToast({ message: `Slot ${time} is already in the list.`, type: 'error' }));
            return;
        }
        setSlots((prev) =>
            [...prev, { startTime: time, availableSpots: Number(spots) }]
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
        );
    };

    const handleMonthChange = (y, m) => { setCalYear(y); setCalMonth(m); setSelectedDate(null); };
    const handleDateSelect = (ds) => setSelectedDate(ds);

    const handleSave = async () => {
        if (!selectedActivityId || !selectedDate) return;
        if (!editBlocked && editSlots.length === 0) {
            dispatch(showToast({ message: 'Add at least one time slot, or mark the date as blocked.', type: 'error' }));
            return;
        }
        try {
            await dispatch(saveAvailability({
                activityId: selectedActivityId,
                date: selectedDate,
                timeSlots: editBlocked ? [] : editSlots,
                isBlocked: editBlocked,
            })).unwrap();
            dispatch(showToast({ message: editBlocked ? 'Date blocked.' : 'Availability saved!', type: 'success' }));
            dispatch(fetchAvailableSlots({ activityId: selectedActivityId, date: selectedDate }));
        } catch (err) {
            dispatch(showToast({ message: err || 'Failed to save.', type: 'error' }));
        }
    };

    const handleDelete = async () => {
        const rec = records.find((r) => toDateStr(r.date) === selectedDate);
        if (!rec) return;
        setDeletingId(rec._id);
        try {
            await dispatch(deleteAvailability(rec._id)).unwrap();
            dispatch(showToast({ message: 'Availability removed.', type: 'success' }));
            setSelectedDate(null);
            dispatch(clearSlots());
        } catch (err) {
            dispatch(showToast({ message: err || 'Failed to delete.', type: 'error' }));
        } finally {
            setDeletingId(null);
        }
    };

    const handleBulkSave = async () => {
        if (!selectedActivityId) {
            dispatch(showToast({ message: 'Please select an activity first.', type: 'error' })); return;
        }
        if (!bulkStart || !bulkEnd) {
            dispatch(showToast({ message: 'Please select a start and end date.', type: 'error' })); return;
        }
        if (bulkStart > bulkEnd) {
            dispatch(showToast({ message: 'Start date must be before end date.', type: 'error' })); return;
        }
        if (!bulkBlocked && bulkSlots.length === 0) {
            dispatch(showToast({ message: 'Add at least one time slot.', type: 'error' })); return;
        }
        try {
            const result = await dispatch(saveBulkAvailability({
                activityId: selectedActivityId,
                startDate: bulkStart,
                endDate: bulkEnd,
                weekdays: bulkWeekdays,
                timeSlots: bulkBlocked ? [] : bulkSlots,
                isBlocked: bulkBlocked,
            })).unwrap();
            dispatch(showToast({ message: result?.message || 'Bulk availability saved!', type: 'success' }));
            dispatch(fetchAvailability({ activityId: selectedActivityId }));
            setActiveTab('calendar');
        } catch (err) {
            dispatch(showToast({ message: err || 'Failed to save bulk availability.', type: 'error' }));
        }
    };

    const toggleBulkWeekday = (val) =>
        setBulkWeekdays((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);

    useEffect(() => {
        if (activeTab === 'timeline' && !selectedDate) {
            setSelectedDate(todayStr());
        }
    }, [activeTab, selectedDate]);

    // ── Derived display values ────────────────────────────────────────────────

    const selectedRecord = selectedDate ? records.find((r) => toDateStr(r.date) === selectedDate) : null;
    const selectedDateLabel = selectedDate
        ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })
        : '';
    const isSelectedBlocked = slotsData?.isBlocked ?? selectedRecord?.isBlocked ?? false;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">

            {/* ── Activity selector ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-forest-950 mb-4">Select Activity</h3>
                {activities.length === 0 ? (
                    <p className="text-sm text-gray-500">Create at least one activity before defining availability.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activities.map((act) => {
                            const id = act._id || act.id;
                            const sel = id === selectedActivityId;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedActivityId(id);
                                        setSelectedDate(null);
                                        setEditSlots([]);
                                        dispatch(clearSlots());
                                    }}
                                    className={`text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${sel
                                        ? 'bg-forest-900 border-forest-900 text-white shadow-md'
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-forest-300 hover:bg-forest-50'
                                        }`}
                                >
                                    <span className="line-clamp-1">{act.title}</span>
                                    <span className={`text-xs font-normal mt-0.5 block ${sel ? 'text-white/70' : 'text-gray-400'}`}>
                                        {act.duration ? `${act.duration}h` : ''}
                                        {act.city ? ` \xb7 ${act.city}` : ''}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedActivityId && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* ── Tabs + live badge ── */}
                    <div className="flex items-center border-b border-gray-100">
                        <div className="flex flex-1 overflow-x-auto">
                            {[
                                ['calendar', 'Calendar'],
                                ['timeline', 'Timeline'],
                                ['bulk', 'Bulk Setup'],
                            ].map(([id, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setActiveTab(id)}
                                    className={`px-5 py-3.5 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === id
                                        ? 'text-forest-900 border-b-2 border-forest-900 bg-forest-50/40'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Auto-refresh indicator */}
                        <div className="px-4 flex items-center gap-1.5 flex-shrink-0">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="text-xs text-gray-400 font-medium hidden sm:block">
                                {lastRefreshed
                                    ? `Updated ${lastRefreshed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                                    : 'Live'}
                            </span>
                        </div>
                    </div>

                    <div className="p-6">

                        {/* ═══ Calendar View ═══ */}
                        {activeTab === 'calendar' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                {/* Left: MiniCalendar */}
                                <div>
                                    {selectedActivity && (
                                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                                            <strong>{selectedActivity.title}</strong> &middot; {selectedActivity.duration}h per booking.
                                            {' '}Click any future date to manage its slots.
                                        </p>
                                    )}
                                    <MiniCalendar
                                        year={calYear}
                                        month={calMonth}
                                        onMonthChange={handleMonthChange}
                                        selectedDate={selectedDate}
                                        onDateSelect={handleDateSelect}
                                        dateStatusMap={dateStatusMap}
                                        loading={loading}
                                        minDate={todayStr()}
                                        allowAllFuture={true}
                                    />
                                </div>

                                {/* Right: Day editor */}
                                <div>
                                    {!selectedDate ? (
                                        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                            <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-sm text-gray-400 font-medium">Select a date on the calendar</p>
                                            <p className="text-xs text-gray-300 mt-1">to add, edit, or block availability</p>
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Date header */}
                                            <div className="flex items-start justify-between mb-4 gap-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-sm">{selectedDateLabel}</h4>
                                                    {selectedRecord && (
                                                        <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-0.5 ${selectedRecord.isBlocked ? 'text-red-500' : 'text-emerald-600'
                                                            }`}>
                                                            {selectedRecord.isBlocked
                                                                ? '\u26D4 Blocked'
                                                                : `\u2713 ${selectedRecord.timeSlots?.length || 0} slot(s) defined`}
                                                        </span>
                                                    )}
                                                </div>
                                                {selectedRecord && (
                                                    <button
                                                        type="button"
                                                        onClick={handleDelete}
                                                        disabled={!!deletingId}
                                                        className="flex-shrink-0 text-xs text-red-400 hover:text-red-600 font-semibold transition-colors disabled:opacity-50"
                                                    >
                                                        {deletingId ? 'Removing\u2026' : 'Remove date'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Block toggle */}
                                            <label className="flex items-center gap-3 cursor-pointer mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                                                <input
                                                    type="checkbox"
                                                    checked={editBlocked}
                                                    onChange={(e) => { setEditBlocked(e.target.checked); if (e.target.checked) setEditSlots([]); }}
                                                    className="w-4 h-4 accent-red-500 rounded"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-red-700">Block this date</p>
                                                    <p className="text-xs text-red-400 mt-0.5">Clients won&#39;t be able to book on this day</p>
                                                </div>
                                            </label>

                                            {!editBlocked && (
                                                <>
                                                    {/* Slot list — enriched with live occupancy */}
                                                    {editSlots.length > 0 && (
                                                        <div className="space-y-2 mb-4">
                                                            {slotsLoading && (
                                                                <p className="flex items-center gap-1.5 text-xs text-gray-400">
                                                                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                                    </svg>
                                                                    Fetching booking data&hellip;
                                                                </p>
                                                            )}
                                                            {editSlots.map((slot) => (
                                                                <SlotCard
                                                                    key={slot.startTime}
                                                                    slot={slot}
                                                                    endTime={computeEndTime(slot.startTime, selectedActivity?.duration)}
                                                                    enriched={enrichedSlotsMap[slot.startTime] ?? null}
                                                                    onRemove={() => setEditSlots((p) => p.filter((s) => s.startTime !== slot.startTime))}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Add-slot form with overlap guard */}
                                                    <SlotAdder
                                                        time={newTime} setTime={setNewTime}
                                                        spots={newSpots} setSpots={setNewSpots}
                                                        onAdd={() => addSlotToList(editSlots, setEditSlots, newTime, newSpots)}
                                                        conflict={addSlotConflict}
                                                        endTimePreview={addSlotEndPreview}
                                                    />
                                                </>
                                            )}

                                            <button
                                                type="button"
                                                onClick={handleSave}
                                                disabled={saveLoading}
                                                className="w-full mt-4 py-2.5 bg-forest-900 text-white rounded-xl text-sm font-bold hover:bg-forest-800 transition-colors disabled:opacity-60"
                                            >
                                                {saveLoading ? 'Saving\u2026' : editBlocked ? 'Block This Date' : 'Save Availability'}
                                            </button>

                                            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ═══ Timeline View ═══ */}
                        {activeTab === 'timeline' && (
                            <TimelineView
                                slots={timelineSlots}
                                isBlocked={isSelectedBlocked}
                                durationHours={selectedActivity?.duration ?? 1}
                                selectedDate={selectedDate}
                                minDate={todayStr()}
                                onDateChange={setSelectedDate}
                            />
                        )}

                        {/* ═══ Bulk Setup ═══ */}
                        {activeTab === 'bulk' && (
                            <div className="max-w-lg space-y-5">
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Define or block availability for a date range at once.
                                    Choose the days of the week that apply.
                                </p>

                                {/* Date range */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Date Range</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[11px] text-gray-500 mb-1">Start</p>
                                            <input type="date" min={todayStr()} value={bulkStart}
                                                onChange={(e) => setBulkStart(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-300 text-sm" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-gray-500 mb-1">End</p>
                                            <input type="date" min={bulkStart || todayStr()} value={bulkEnd}
                                                onChange={(e) => setBulkEnd(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-300 text-sm" />
                                        </div>
                                    </div>
                                </div>

                                {/* Weekdays */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Apply to weekdays</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {WEEKDAY_LIST.map(({ label, value }) => (
                                            <button key={value} type="button" onClick={() => toggleBulkWeekday(value)}
                                                className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all ${bulkWeekdays.includes(value)
                                                    ? 'bg-forest-900 text-white border-forest-900'
                                                    : 'bg-white text-gray-400 border-gray-200 hover:border-forest-300'
                                                    }`}>
                                                {label}
                                            </button>
                                        ))}
                                        <button type="button"
                                            onClick={() => setBulkWeekdays(bulkWeekdays.length === 7 ? [] : [0, 1, 2, 3, 4, 5, 6])}
                                            className="px-3 h-10 rounded-xl text-xs font-semibold border border-gray-200 text-gray-500 hover:border-forest-300 transition-all">
                                            {bulkWeekdays.length === 7 ? 'None' : 'All'}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        {bulkWeekdays.length === 0
                                            ? 'No days selected \u2014 nothing will be saved.'
                                            : `${bulkWeekdays.length} day${bulkWeekdays.length !== 1 ? 's' : ''} per week`}
                                    </p>
                                </div>

                                {/* Block toggle */}
                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-red-50 border border-red-100 rounded-xl">
                                    <input type="checkbox" checked={bulkBlocked}
                                        onChange={(e) => { setBulkBlocked(e.target.checked); if (e.target.checked) setBulkSlots([]); }}
                                        className="w-4 h-4 accent-red-500 rounded" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-700">Block all selected dates</p>
                                        <p className="text-xs text-red-400 mt-0.5">Mark all matching dates as unavailable</p>
                                    </div>
                                </label>

                                {!bulkBlocked && (
                                    <>
                                        {bulkSlots.length > 0 && (
                                            <div className="space-y-2">
                                                {bulkSlots.map((slot) => (
                                                    <SlotCard
                                                        key={slot.startTime}
                                                        slot={slot}
                                                        endTime={computeEndTime(slot.startTime, selectedActivity?.duration)}
                                                        enriched={null}
                                                        onRemove={() => setBulkSlots((p) => p.filter((s) => s.startTime !== slot.startTime))}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <SlotAdder
                                            time={bulkNewTime} setTime={setBulkNewTime}
                                            spots={bulkNewSpots} setSpots={setBulkNewSpots}
                                            onAdd={() => addSlotToList(bulkSlots, setBulkSlots, bulkNewTime, bulkNewSpots)}
                                            conflict={bulkAddSlotConflict}
                                            endTimePreview={bulkAddSlotEndPreview}
                                        />
                                    </>
                                )}

                                <button type="button" onClick={handleBulkSave}
                                    disabled={bulkLoading || bulkWeekdays.length === 0}
                                    className="w-full py-3 bg-forest-900 text-white rounded-xl text-sm font-bold hover:bg-forest-800 transition-colors disabled:opacity-60">
                                    {bulkLoading ? 'Applying\u2026' : bulkBlocked ? 'Block Date Range' : 'Apply Bulk Availability'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailabilityManager;
